import { test as base, expect, type Page } from "@playwright/test";

/**
 * 대상 앱과 맺은 계약.
 *
 * 앱 코드에 테스트 전용 전역 훅(`window.__test` 류)은 넣지 않았다.
 * 제품에 테스트용 표면을 만들면 그게 곧 운영 코드가 된다.
 * localStorage 키와 `data-testid` 만으로 충분하다.
 *
 * 계약 원문: loyalhub/docs/E2E.md
 */
export const STORAGE = {
  loggedIn: "loyalhub:isLoggedIn",
  user: "loyalhub:user",
  demo: "loyalhub:demo",
  avgTicket: "loyalhub:avgTicket",
  conversionRate: "loyalhub:conversionRate",
} as const;

/**
 * 시드가 기대하는 값. 대상 앱의 docs/E2E.md §3 과 같은 표다.
 *
 * 🔴 **날짜가 아니라 버킷 인원수를 검증한다.** 시드 날짜가 실행 시점 기준
 * 상대값이라 날짜를 박아두면 내일 깨진다. 예전에 고정 날짜를 쓰다가
 * 시간이 지나며 전원이 '이탈 위험' 한 칸으로 몰린 적이 있다.
 */
export const BUCKETS = {
  todayVisitors: 1,
  totalCustomers: 10,
  vip: 3,
  stale7: 2, // 7~30일 미방문
  churn: 3, // 이탈 위험 (>30일)
  thisWeek: 4, // ≤7일
  neverVisited: 1, // 방문 이력 없음 (서지호)
  couponHistory: 5,
} as const;

/**
 * 모든 테스트를 같은 상태에서 시작시킨다.
 *
 * ⚠️ **반드시 페이지 로드 전에 심어야 한다.** `demoStore` 는 모듈 로드 시점에
 * localStorage 를 한 번만 읽는다. 로드 후에 바꾸면 반영되지 않는다.
 * 그래서 `addInitScript` 다.
 */
async function seedCleanSession(page: Page, { loggedIn = true } = {}) {
  await page.addInitScript(
    ({ keys, shouldLogIn }) => {
      // 앞선 테스트가 남긴 데모 데이터를 지운다 → 시드로 복구된다
      window.localStorage.removeItem(keys.demo);
      if (shouldLogIn) {
        window.localStorage.setItem(keys.loggedIn, "true");
      } else {
        window.localStorage.removeItem(keys.loggedIn);
      }
    },
    { keys: STORAGE, shouldLogIn: loggedIn },
  );
}

type Fixtures = {
  /** 로그인된 상태에서 시작하는 페이지 */
  app: Page;
  /** 로그인하지 않은 상태에서 시작하는 페이지 */
  anonymous: Page;
};

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    await seedCleanSession(page, { loggedIn: true });
    await use(page);
  },
  anonymous: async ({ page }, use) => {
    await seedCleanSession(page, { loggedIn: false });
    await use(page);
  },
});

export { expect };
