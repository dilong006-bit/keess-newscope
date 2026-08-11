import { defineConfig, devices } from '@playwright/test';

/**
 * 회귀 테스트 설정.
 *
 * 포트는 프로젝트 dev 포트(3001)를 그대로 쓴다. 별도 포트로 두 번째 next dev를 띄우면
 * 두 서버가 같은 .next 디렉터리에 동시에 쓰게 되고(next는 distDir이 프로젝트 단위다),
 * 여기에 next build까지 겹치면 산출물이 섞여 서버가 500을 뱉는다. 실제로 겪은 사고다.
 * 이미 떠 있는 dev 서버가 있으면 재사용하고, 없을 때만 새로 띄운다(CI 제외).
 * 정말 포트를 나눠야 하면 PW_PORT로 덮어쓰되, 다른 dev 서버·빌드와 겹치지 않게 할 것.
 */
const PORT = Number(process.env.PW_PORT ?? 3001);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['iPhone 13'],
    // iPhone 13 프로필은 webkit을 기본으로 잡지만, 이 저장소의 계측 도구
    // (scripts/measure-hero.mjs · scripts/mobile-audit.mjs)는 모두 chromium 기준이다.
    // 브라우저를 맞춰야 같은 수치를 놓고 이야기할 수 있다.
    browserName: 'chromium',
    // 뷰포트는 각 테스트가 setViewportSize로 직접 지정한다
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    // 이미 dev 서버가 떠 있으면 그대로 쓴다(위 주석의 .next 경합 방지)
    url: `http://localhost:${PORT}/ax-ai`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
