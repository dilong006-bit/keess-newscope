#!/usr/bin/env node
/**
 * P1·P2 히어로 상단 스크린샷 (전/후 대조용)
 *   실행: BASE_URL=http://localhost:3010 OUT=audit/hero-after node scripts/shoot-hero.mjs
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? 'audit/hero';
const PAGES = ['/ax-ai', '/leadership'];
const VPS = [[360, 640, true], [390, 844, true], [430, 932, true], [1280, 800, false]];

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const path of PAGES) {
  for (const [w, h, mobile] of VPS) {
    const ctx = await b.newContext({
      viewport: { width: w, height: h }, deviceScaleFactor: 2,
      isMobile: mobile, hasTouch: mobile,
      ...(mobile ? { userAgent: devices['iPhone 13'].userAgent } : {}),
    });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(800);
    const name = `${path.replace(/\//g, '')}_${w}x${h}.png`;
    await p.screenshot({ path: `${OUT}/${name}` });
    console.log(`${OUT}/${name}`);
    await ctx.close();
  }
}
await b.close();
