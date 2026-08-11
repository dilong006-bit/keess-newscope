#!/usr/bin/env node
/**
 * P1·P2 모바일 히어로 상단 계측 (헤더 로고 ↔ 히어로 아이브로 배지 겹침 진단)
 *
 *   실행: BASE_URL=http://localhost:3001 node scripts/measure-hero.mjs
 *
 * ※ playwright 필요. 앵커는 data-probe="logo" / "hero" / "hero-badge" (마크업 상시 유지).
 */
import { chromium, devices } from 'playwright';

const PAGES = ['/ax-ai', '/leadership'];
const VPS = [[360, 640], [390, 844], [414, 896], [430, 932]];
const BASE = process.env.BASE_URL ?? 'http://localhost:3001';

const b = await chromium.launch();
const rows = [];
for (const path of PAGES) {
  for (const [w, h] of VPS) {
    const ctx = await b.newContext({
      viewport: { width: w, height: h }, isMobile: true, hasTouch: true,
      deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent,
    });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(600);
    const data = await p.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          sel, top: +r.top.toFixed(1), left: +r.left.toFixed(1),
          bottom: +r.bottom.toFixed(1), right: +r.right.toFixed(1),
          h: +r.height.toFixed(1), position: cs.position, zIndex: cs.zIndex,
        };
      };
      const header = pick('header');
      const logo = pick('[data-probe="logo"]');
      const badge = pick('[data-probe="hero-badge"]');
      const hero = pick('[data-probe="hero"]');
      const heroEl = document.querySelector('[data-probe="hero"]');
      const heroCS = heroEl ? (() => {
        const cs = getComputedStyle(heroEl);
        return {
          display: cs.display, alignItems: cs.alignItems,
          justifyContent: cs.justifyContent, minHeight: cs.minHeight,
          paddingTop: cs.paddingTop, overflow: cs.overflow,
          contentH: +heroEl.scrollHeight.toFixed(1),
        };
      })() : null;
      // 높이 예산(§STEP 3): 칩 하단이 fold 안에 들고, 하단 카드가 peek 되는지
      const strip = pick('.ax-strip') ?? pick('.ld-strip');
      const card = pick('.ax-visual') ?? pick('.ld-visual');
      const ov = (a, c) => !!a && !!c &&
        a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
      return {
        header, logo, badge, hero, heroCS,
        stripBottom: strip?.bottom ?? null,
        cardPeek: card ? +(Math.min(card.bottom, innerHeight) - card.top).toFixed(1) : null,
        overlap: ov(logo, badge),
        badgeTopMinusLogoBottom: logo && badge ? +(badge.top - logo.bottom).toFixed(1) : null,
        leftAxisDelta: logo && badge ? +Math.abs(badge.left - logo.left).toFixed(1) : null,
        docOverflowX: document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });
    rows.push({ path, vp: `${w}x${h}`, ...data });
    console.log(JSON.stringify({ path, vp: `${w}x${h}`, ...data }, null, 2));
    await ctx.close();
  }
}
await b.close();

// 요약 표
console.log('\n=== SUMMARY ===');
console.log('page/vp'.padEnd(24), 'hdr.pos'.padEnd(9), 'hdr.h'.padEnd(7),
  'hero.align'.padEnd(12), 'hero.pt'.padEnd(9), 'scrollH'.padEnd(9),
  'logo.top/bot'.padEnd(14), 'badge.top'.padEnd(10), 'gap'.padEnd(8), 'overlap'.padEnd(9),
  'stripBot'.padEnd(10), 'cardPeek');
for (const r of rows) {
  console.log(
    `${r.path} @${r.vp}`.padEnd(24),
    String(r.header?.position).padEnd(9),
    String(r.header?.h).padEnd(7),
    String(r.heroCS?.alignItems).padEnd(12),
    String(r.heroCS?.paddingTop).padEnd(9),
    String(r.heroCS?.contentH).padEnd(9),
    `${r.logo?.top}/${r.logo?.bottom}`.padEnd(14),
    String(r.badge?.top).padEnd(10),
    String(r.badgeTopMinusLogoBottom).padEnd(8),
    String(r.overlap).padEnd(9),
    String(r.stripBottom).padEnd(10),
    String(r.cardPeek),
  );
}
