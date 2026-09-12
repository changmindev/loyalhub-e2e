import { test, expect, STORAGE } from "../fixtures";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("인증", () => {
  test("아무 이메일·비밀번호로 로그인하면 대시보드로 들어간다", async ({ anonymous }) => {
    const login = await new LoginPage(anonymous).open();
    await login.signIn();

    await expect(anonymous).toHaveURL(/\/$/);
    await expect(new DashboardPage(anonymous).totalCustomers).toBeVisible();
  });

  test("빈 값으로는 제출되지 않는다", async ({ anonymous }) => {
    const login = await new LoginPage(anonymous).open();
    await login.submit.click();

    // required 가 막아 주소가 그대로다. 브라우저 기본 검증에 기대는 부분이라
    // '에러 문구'가 아니라 '이동하지 않았다'로 판정한다.
    await expect(anonymous).toHaveURL(/\/login$/);
    await expect(login.email).toHaveJSProperty("validity.valid", false);
  });

  test("로그인하지 않고 보호 라우트에 직접 들어가면 로그인으로 되돌린다", async ({ anonymous }) => {
    for (const path of ["/", "/customers", "/coupon", "/settings"]) {
      await anonymous.goto(path);
      await expect(anonymous, `${path} 는 보호돼야 한다`).toHaveURL(/\/login$/);
    }
  });

  test("로그인 상태는 새로고침을 넘겨서 유지된다", async ({ app }) => {
    await new DashboardPage(app).open();
    await app.reload();

    await expect(new DashboardPage(app).totalCustomers).toBeVisible();
    await expect
      .poll(() => app.evaluate((k) => window.localStorage.getItem(k), STORAGE.loggedIn))
      .toBe("true");
  });
});
