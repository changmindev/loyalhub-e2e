import type { Page, Locator } from "@playwright/test";

export type Segment = "all" | "vip" | "churn" | "this-week";

/** 단골 목록. 세그먼트는 URL 이 단일 출처라, 탭을 누르지 않고도 상태를 만들 수 있다. */
export class CustomersPage {
  readonly items: Locator;
  readonly count: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId("customer-item");
    this.count = page.getByTestId("customer-count");
  }

  /** 세그먼트를 URL 로 직접 연다. 탭 클릭 경로와 결과가 같아야 한다. */
  async open(segment: Segment = "all") {
    await this.page.goto(segment === "all" ? "/customers" : `/customers?seg=${segment}`);
    return this;
  }

  tab(segment: Segment): Locator {
    return this.page.getByTestId(`segment-tab-${segment}`);
  }

  /** 화면에 보이는 고객 이름. data-customer-name 은 표시 문구가 바뀌어도 버티는 계약이다. */
  async names(): Promise<string[]> {
    return this.items.evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).dataset.customerName ?? ""),
    );
  }

  /** 위험도 배지를 색이 아니라 값으로 읽는다. */
  riskBadges(level: "none" | "ok" | "warn" | "danger"): Locator {
    return this.page.locator(`[data-testid="risk-badge"][data-risk-level="${level}"]`);
  }

  /**
   * `data-customer-name` 은 항목 **자신**에 붙어 있다. 자식으로 찾으면 못 찾는다.
   * (처음에 filter({ has: ... }) 로 썼다가 0건이 잡혔다)
   */
  async openDetail(name: string) {
    await this.page
      .locator(`[data-testid="customer-item"][data-customer-name="${name}"]`)
      .click();
  }
}
