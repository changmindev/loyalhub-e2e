import { defineConfig, devices } from "@playwright/test";

/**
 * 대상은 환경변수로 갈아끼운다.
 *
 * 같은 테스트 코드가 배포본과 로컬 개발 서버를 모두 겨냥해야 한다.
 * 배포본만 보면 "머지 전에" 확인할 방법이 없고, 로컬만 보면
 * "실제로 배포된 것"을 확인할 방법이 없다.
 *
 *   npx playwright test                                  → 배포본
 *   BASE_URL=http://localhost:8080 npx playwright test   → 로컬 dev 서버
 */
const BASE_URL = process.env.BASE_URL ?? "https://loyalhub-demo.vercel.app";

export default defineConfig({
  testDir: "./tests",

  // 대상 앱은 localStorage 만 쓰고 서버 상태가 없다. 테스트끼리 간섭하지 않는다.
  fullyParallel: true,

  // CI 에서 test.only 가 섞여 들어오면 나머지가 조용히 안 돌게 된다.
  forbidOnly: !!process.env.CI,

  // 🔴 재시도는 0 이다.
  //
  // 재시도를 켜면 '두 번째에 통과한 테스트'가 초록으로 보고된다.
  // 그 순간부터 플래키와 진짜 결함을 구분할 수 없다.
  // 불안정하면 재시도로 덮지 말고 원인을 고친다.
  retries: 0,

  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,

    // 실패했을 때 원인 추적에 필요한 것만 남긴다.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // 대상이 한국어 앱이다. 날짜·숫자 표기가 로캘에 따라 달라지므로 고정한다.
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  expect: {
    // 배포본을 겨냥할 때 콜드 스타트가 있어 기본 5초는 짧다.
    timeout: 10_000,
  },
});
