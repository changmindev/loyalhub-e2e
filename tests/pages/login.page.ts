import type { Page, Locator } from "@playwright/test";

/** 로그인. 실제 인증이 아니라 데모 인증이다 — 아무 값이나 통과한다. */
export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByTestId("login-email");
    this.password = page.getByTestId("login-password");
    this.submit = page.getByTestId("login-submit");
  }

  async open() {
    await this.page.goto("/login");
    return this;
  }

  async signIn(email = "demo@loyalhub.test", password = "demo1234") {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
