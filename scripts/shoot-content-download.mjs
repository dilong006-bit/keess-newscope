#!/usr/bin/env node
/**
 * /content 다운로드 섹션 + 다크 히어로 스크린샷 (무시제 문구 전환 전/후 대조용)
 *   실행: BASE_URL=http://localhost:3001 OUT=audit/content-after node scripts/shoot-content-download.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? 'audit/content';
const VPS = [[390, 900, true], [810, 1100, true], [1440, 1000, false]];

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [w, h, mobile] of VPS) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2,
    isMobile: mobile, hasTouch: mobile,
    ...(mobile ? { userAgent: devices['iPhone 13'].userAgent } : {}),
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/content#download`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForSelector('.dl-file', { timeout: 30000 });
  await p.waitForTimeout(900);

  for (const [sel, name] of [['#download .dl', 'download'], ['.final', 'hero']]) {
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await el.screenshot({ path: `${OUT}/${name}_${w}.png` });
    console.log(`${OUT}/${name}_${w}.png`);
  }
  await ctx.close();
}
await b.close();
