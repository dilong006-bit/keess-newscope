#!/usr/bin/env node
/**
 * 모바일 대응 계측 (모바일대응 고도화 기술명세서 v1.0 §7)
 *
 * 320 / 360 / 390 / 768px × 7개 페이지를 순회하며 C1~C5(치명)·Q1~Q2(품질)를
 * 자동 계측하고 JSON 리포트와 fullPage 스크린샷을 남긴다.
 *
 *   실행: BASE=http://localhost:3001 node scripts/mobile-audit.mjs > audit/report.json
 *
 * ※ playwright가 필요하다(프로젝트 의존성 아님). 실행 전 별도 설치:
 *     npm i -D playwright && npx playwright install chromium
 * ※ data-hscroll 또는 .hscroll 컨테이너 내부는 의도된 가로 스크롤로 보아 C2에서 제외한다.
 */
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3001';
const PAGES = ['/', '/ax-ai', '/leadership', '/hrd', '/content', '/kium', '/csr'];
const VPS = [320, 360, 390, 768];

const browser = await chromium.launch();
const report = [];

for (const w of VPS) {
  for (const path of PAGES) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 }, deviceScaleFactor: 2,
      isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    const r = await page.evaluate((VW) => {
      const sel = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        const c = typeof el.className === 'string' ? el.className.trim() : '';
        if (c) s += '.' + c.split(/\s+/).slice(0, 3).join('.');
        return s;
      };
      const sectionOf = (el) => {
        const s = el.closest('section, [data-section]');
        if (!s) return '(none)';
        const h = s.querySelector('h1,h2,h3');
        return (s.id || '') + '|' + (h ? h.textContent.trim().slice(0, 28) : sel(s));
      };
      const inScroller = (el) => !!el.closest('[data-hscroll], .hscroll');
      const out = {
        C1_pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
          ? { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth } : null,
        C2_outOfViewport: [], C3_narrowText: [], C4_verticalCollapse: [],
        C5_clipped: [], Q1_tinyTargets: [], Q2_smallFont: [],
      };
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        const leaf = el.children.length === 0;
        const txt = (el.textContent || '').trim();

        if (!inScroller(el) && b.width > 8 && (b.right > VW + 1 || b.left < -1))
          out.C2_outOfViewport.push({ sec: sectionOf(el), sel: sel(el), left: Math.round(b.left), right: Math.round(b.right) });

        if (leaf && txt.length > 4) {
          if (b.width < 160) out.C3_narrowText.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), text: txt.slice(0, 30) });
          if (b.height > b.width * 2.2) out.C4_verticalCollapse.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), h: Math.round(b.height), text: txt.slice(0, 30) });
          const fs = parseFloat(cs.fontSize);
          if (fs < 12) out.Q2_smallFont.push({ sec: sectionOf(el), sel: sel(el), fs });
        }
        if (cs.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2 && b.width > 40)
          out.C5_clipped.push({ sec: sectionOf(el), sel: sel(el), clientW: el.clientWidth, scrollW: el.scrollWidth });

        if ((el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button')
            && b.width > 0 && (b.height < 44 || b.width < 44))
          out.Q1_tinyTargets.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), h: Math.round(b.height), text: txt.slice(0, 20) });
      }
      const dedup = (a, k) => { const s = new Set(); return a.filter(o => { const v = k(o); if (s.has(v)) return false; s.add(v); return true; }); };
      for (const k of ['C2_outOfViewport','C3_narrowText','C4_verticalCollapse','C5_clipped','Q1_tinyTargets','Q2_smallFont'])
        out[k] = dedup(out[k], o => o.sec + o.sel + (o.w ?? o.fs ?? ''));
      return out;
    }, w);

    report.push({ viewport: w, path, ...r });
    await page.screenshot({ path: `audit/${w}${path.replace(/\//g,'_')||'_home'}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
