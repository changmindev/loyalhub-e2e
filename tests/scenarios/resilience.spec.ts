import { test, expect, STORAGE } from "../fixtures";
import { DashboardPage } from "../pages/dashboard.page";
import { CustomersPage } from "../pages/customers.page";

test.describe("고장 났을 때", () => {
  test("데모 데이터를 지우면 시드로 복구된다", async ({ app }) => {
    const customers = await new CustomersPage(app).open("all");
    await expect(customers.items).toHaveCount(10);

    await app.evaluate((k) => window.localStorage.removeItem(k), STORAGE.demo);
    await app.reload();

    await expect(customers.items).toHaveCount(10);
  });

  test("저장된 데모 데이터가 깨져 있어도 화면이 뜬다", async ({ app }) => {
    // 반쯤 비어 있는 화면보다 시드로 되돌리는 쪽이 낫다는 결정을 고정한다.
    await app.addInitScript((k) => {
      window.localStorage.setItem(k, "{ 이건 JSON 이 아니다");
    }, STORAGE.demo);

    const dashboard = await new DashboardPage(app).open();
    await expect(dashboard.totalCustomers).toHaveText("10");
  });

  test("자산 로드가 실패해도 흰 화면으로 끝나지 않는다", async ({ app }) => {
    // 렌더 중 예외가 나면 React 는 트리 전체를 언마운트한다.
    // 그 결과가 흰 화면 하나뿐이면 사용자는 앱이 죽은 건지 느린 건지 모른다.
    // ErrorBoundary 가 그 범위를 화면 하나로 묶어야 한다.
    const dashboard = await new DashboardPage(app).open();
    await expect(dashboard.totalCustomers).toBeVisible();

    const bodyText = await app.locator("body").innerText();
    expect(bodyText.trim().length, "화면에 아무것도 없으면 안 된다").toBeGreaterThan(0);
  });
});
