import type { Page, Locator } from "@playwright/test";

/** 쿠폰 발송. */
export class CouponPage {
  readonly smsNotice: Locator;
  readonly targetCount: Locator;
  readonly message: Locator;
  readonly send: Locator;
  readonly historyItems: Locator;

  constructor(private readonly page: Page) {
    this.smsNotice = page.getByTestId("sms-demo-notice");
    this.targetCount = page.getByTestId("target-count");
    this.message = page.getByTestId("coupon-message");
    this.send = page.getByTestId("coupon-send");
    this.historyItems = page.getByTestId("coupon-history-item");
  }

  async open() {
    await this.page.goto("/coupon");
    return this;
  }

  target(grade: "전체" | "VIP" | "단골" | "일반"): Locator {
    return this.page.getByTestId(`target-option-${grade}`);
  }

  async compose(text: string) {
    await this.message.fill(text);
  }
}
