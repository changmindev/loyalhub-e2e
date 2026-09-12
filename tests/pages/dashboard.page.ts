import type { Page, Locator } from "@playwright/test";

/**
 * 대시보드.
 *
 * 셀렉터는 이 계층 밖으로 새지 않는다. 테스트 본문에 `data-testid` 문자열이
 * 보이기 시작하면, 제품이 id 하나만 바꿔도 어디를 고쳐야 하는지 알 수 없게 된다.
 */
export class DashboardPage {
  readonly banner: Locator;
  readonly todayVisitors: Locator;
  readonly totalCustomers: Locator;
  readonly vip: Locator;
  readonly recentCoupon: Locator;
  readonly stale7: Locator;
  readonly churn: Locator;
  readonly queryError: Locator;
  readonly queryErrorRetry: Locator;

  constructor(private readonly page: Page) {
    this.banner = page.getByTestId("demo-banner");
    this.todayVisitors = page.getByTestId("stat-today-visitors");
    this.totalCustomers = page.getByTestId("stat-total-customers");
    this.vip = page.getByTestId("stat-vip");
    this.recentCoupon = page.getByTestId("stat-recent-coupon");
    this.stale7 = page.getByTestId("segment-stale7");
    this.churn = page.getByTestId("segment-danger");
    this.queryError = page.getByTestId("query-error");
    this.queryErrorRetry = page.getByTestId("query-error-retry");
  }

  async open() {
    await this.page.goto("/");
    return this;
  }
}
