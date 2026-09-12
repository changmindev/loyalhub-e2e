import { test, expect, BUCKETS } from "../fixtures";
import { DashboardPage } from "../pages/dashboard.page";
import { CustomersPage } from "../pages/customers.page";

test.describe("대시보드", () => {
  test("지표가 시드 버킷과 일치한다", async ({ app }) => {
    const dashboard = await new DashboardPage(app).open();

    // 날짜가 아니라 버킷 인원수를 본다. 시드 날짜가 실행 시점 기준 상대값이라
    // 날짜를 박아두면 내일 깨진다.
    await expect(dashboard.todayVisitors).toHaveText(String(BUCKETS.todayVisitors));
    await expect(dashboard.totalCustomers).toHaveText(String(BUCKETS.totalCustomers));
    await expect(dashboard.vip).toHaveText(String(BUCKETS.vip));
    await expect(dashboard.stale7).toHaveText(String(BUCKETS.stale7));
    await expect(dashboard.churn).toHaveText(String(BUCKETS.churn));
  });

  test("데모 데이터임을 화면에 밝힌다", async ({ app }) => {
    const dashboard = await new DashboardPage(app).open();
    await expect(dashboard.banner).toBeVisible();
    await expect(dashboard.banner).toContainText("데모 데이터");
  });

  test("날짜를 ISO 타임스탬프 날것으로 노출하지 않는다", async ({ app }) => {
    // 대시보드 두 카드가 같은 sentAt 을 서로 다르게 표시하던 결함(D-18)을 고정한다.
    // 한쪽은 2026-09-12T05:10:15.074Z, 다른 쪽은 2026.09.12 였다.
    await new DashboardPage(app).open();
    const body = await app.locator("body").innerText();
    expect(body, "화면에 ISO 타임스탬프가 새면 안 된다").not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:/);
  });

  test("이탈 위험 CTA 가 해당 세그먼트로 데려간다", async ({ app }) => {
    await new DashboardPage(app).open();
    await app.getByRole("button", { name: /고객 리스트 보기/ }).click();

    await expect(app).toHaveURL(/seg=churn/);
    await expect(new CustomersPage(app).items).toHaveCount(BUCKETS.churn);
  });
});
