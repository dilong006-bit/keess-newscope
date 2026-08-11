#!/usr/bin/env node
/**
 * /kium 과정 그리드 전경 스크린샷 (소개문 교체 전/후 대조용)
 *   실행: BASE_URL=http://localhost:3001 OUT=audit/kium-after node scripts/shoot-kium-grid.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? 'audit/kium';
const VPS = [[390, 1400, true], [1440, 1200, false]];

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [w, h, mobile] of VPS) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2,
    isMobile: mobile, hasTouch: mobile,
    ...(mobile ? { userAgent: devices['iPhone 13'].userAgent } : {}),
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/kium#courses`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForSelector('.kium-card-summary', { timeout: 30000 });
  await p.waitForTimeout(900);
  // 그리드 전경 — 카드 목록 컨테이너만
  const grid = p.locator('.kium-grid').first();
  await grid.scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await grid.screenshot({ path: `${OUT}/grid_${w}.png` });
  console.log(`${OUT}/grid_${w}.png`);
  await ctx.close();
}
await b.close();
