import { test, expect } from '@playwright/test';

/**
 * 모바일 히어로 상단 회귀 감시 — 헤더 로고와 히어로 아이브로 배지의 겹침.
 *
 * 사람 눈 검수로 두 번 놓친 결함이라 코드가 잡는다. 앵커는 마크업의
 * data-probe="logo" / "hero-badge" (Nav.tsx · axai/leadership Sections.tsx).
 * 셀렉터를 바꾸거나 skip 처리해서 통과시키지 말 것 — 겹침이 다시 열린다.
 */
const PAGES = ['/ax-ai', '/leadership'];
const VPS = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '430x932', width: 430, height: 932 },
];

interface Rect { left: number; right: number; top: number; bottom: number }
const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

for (const path of PAGES) {
  for (const vp of VPS) {
    test(`${path} @${vp.name} — 로고/배지 겹침 없음`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const logo = await page.locator('[data-probe="logo"]').boundingBox();
      const badge = await page.locator('[data-probe="hero-badge"]').boundingBox();
      expect(logo, '로고 요소를 찾지 못함').toBeTruthy();
      expect(badge, '배지 요소를 찾지 못함').toBeTruthy();

      const L: Rect = {
        left: logo!.x, right: logo!.x + logo!.width,
        top: logo!.y, bottom: logo!.y + logo!.height,
      };
      const B: Rect = {
        left: badge!.x, right: badge!.x + badge!.width,
        top: badge!.y, bottom: badge!.y + badge!.height,
      };

      // 1. 겹치지 않는다
      expect(overlaps(L, B), `겹침 발생 logo=${JSON.stringify(L)} badge=${JSON.stringify(B)}`)
        .toBe(false);
      // 2. 배지는 로고보다 아래에 있고 최소 8px 여백을 둔다
      expect(B.top - L.bottom).toBeGreaterThanOrEqual(8);
      // 3. 좌측 축이 같다 (오차 1px)
      expect(Math.abs(B.left - L.left)).toBeLessThanOrEqual(1);
      // 4. 가로 스크롤 없음
      const overflowX = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflowX, '가로 오버플로 발생').toBe(false);
      // 5. 배지가 뷰포트 좌측에서 잘리지 않음
      expect(B.left).toBeGreaterThanOrEqual(12);
    });
  }
}
