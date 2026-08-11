#!/usr/bin/env node
/**
 * /kium 과정 상세 패널(교육구성 표) 스크린샷 — 개요서 전환 전/후 대조용
 *   실행: BASE_URL=http://localhost:3001 OUT=audit/kium-panel-after node scripts/shoot-kium-panel.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? 'audit/kium-panel';
/** 명세서 검증 대상 — #1 · #8 · #19 */
const TARGETS = [
  ['1', '신입사원 On-Syncing 온보딩 과정'],
  ['8', '임원 역량개발 과정'],
  ['19', 'CS 종합 솔루션 과정'],
];
const VPS = [[390, 900, true], [1440, 1000, false]];

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [w, h, mobile] of VPS) {
  for (const [n, title] of TARGETS) {
    const ctx = await b.newContext({
      viewport: { width: w, height: h }, deviceScaleFactor: 2,
      isMobile: mobile, hasTouch: mobile,
      ...(mobile ? { userAgent: devices['iPhone 13'].userAgent } : {}),
    });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/kium#courses`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForSelector('.kium-card-summary', { timeout: 30000 });
    await p.waitForTimeout(700);

    const idx = await p.evaluate((t) => [...document.querySelectorAll('.kium-card-wrap')]
      .findIndex((c) => {
        const e = c.querySelector('.kium-card-title, .kium-thumb-title');
        return e && e.textContent.trim() === t;
      }), title);
    if (idx < 0) { console.log(`MISS #${n} ${title}`); await ctx.close(); continue; }

    await p.locator('.kium-card-wrap').nth(idx).locator('button.kium-card').click();
    // ≤767px는 바텀시트(.kium-sheet)로 열린다 — 표가 시트 안에 있으므로 시트를 기준으로 찾는다
    const scope = mobile ? p.locator('.kium-sheet.open') : p.locator('.kium-panel-slot.open');
    await scope.locator('.kium-modules').waitFor({ state: 'visible', timeout: 15000 });
    await p.waitForTimeout(900);

    const table = scope.locator('.kium-modules').first();
    if (mobile) {
      // 바텀시트는 position:fixed라 요소 스크린샷이 오클리핑된다(표 대신 뒤 카드가 찍힘).
      // 내부 스크롤러(.kium-sheet-body)로 표를 올린 뒤 뷰포트를 통째로 찍는다.
      await p.evaluate(() => {
        document.querySelector('.kium-sheet.open .kium-modules')
          ?.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/modules_${n}_${w}.png` });
    } else {
      // 데스크톱 인라인 패널 — 교육구성 표만 잘라 행 수 변화가 바로 보이게
      await table.scrollIntoViewIfNeeded();
      await p.waitForTimeout(400);
      await table.screenshot({ path: `${OUT}/modules_${n}_${w}.png` });
    }
    console.log(`${OUT}/modules_${n}_${w}.png  ← #${n} ${title}`);
    await ctx.close();
  }
}
await b.close();
