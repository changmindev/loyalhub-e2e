import { test, expect, BUCKETS } from "../fixtures";
import { CustomersPage, type Segment } from "../pages/customers.page";

test.describe("단골 목록", () => {
  const cases: { seg: Segment; expected: number }[] = [
    { seg: "all", expected: BUCKETS.totalCustomers },
    { seg: "vip", expected: BUCKETS.vip },
    { seg: "churn", expected: BUCKETS.churn },
    { seg: "this-week", expected: BUCKETS.thisWeek },
  ];

  for (const { seg, expected } of cases) {
    test(`세그먼트 ${seg} 딥링크가 ${expected}명을 보여준다`, async ({ app }) => {
      const page = await new CustomersPage(app).open(seg);
      await expect(page.items).toHaveCount(expected);

      // 선택 상태는 CSS 클래스가 아니라 aria-pressed 로 읽는다(D-21).
      // 클래스에 기대면 디자인 토큰을 손대는 순간 조용히 깨진다.
      await expect(page.tab(seg)).toHaveAttribute("aria-pressed", "true");
    });
  }

  test("탭을 눌러도 URL 로 연 것과 결과가 같다", async ({ app }) => {
    const page = await new CustomersPage(app).open("all");
    await page.tab("churn").click();

    await expect(app).toHaveURL(/seg=churn/);
    await expect(page.items).toHaveCount(BUCKETS.churn);
    await expect(page.tab("all")).toHaveAttribute("aria-pressed", "false");
  });

  test("한 번도 안 온 손님은 '이탈 위험'이 아니라 '방문 전'이다", async ({ app }) => {
    // getRiskLevel(null) 이 warn 을 돌려주던 결함(D-20)을 고정한다.
    // 대시보드는 이 사람을 어느 버킷에도 넣지 않는데 상세만 '주의'라고 했다.
    const page = await new CustomersPage(app).open("all");

    await expect(page.riskBadges("none")).toHaveCount(BUCKETS.neverVisited);
    await expect(page.riskBadges("none").first()).toHaveText("방문 전");

    // 방문 이력이 없는 사람은 이탈 위험 세그먼트에서 빠져야 한다.
    const churn = await new CustomersPage(app).open("churn");
    await expect(churn.riskBadges("none")).toHaveCount(0);
  });

  test("목록에서 상세로 들어가면 화면 맨 위에서 시작한다", async ({ app }) => {
    const page = await new CustomersPage(app).open("all");
    await app.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrolled = await app.evaluate(() => Math.round(window.scrollY));
    expect(scrolled, "목록이 스크롤될 만큼 길어야 의미가 있는 테스트다").toBeGreaterThan(0);

    const names = await page.names();
    await page.openDetail(names[names.length - 1]);

    await expect(app).toHaveURL(/\/customers\/\d+$/);
    await expect.poll(() => app.evaluate(() => Math.round(window.scrollY))).toBe(0);
  });

  test("뒤로 가면 보던 자리로 돌아온다", async ({ app }) => {
    const page = await new CustomersPage(app).open("all");
    await app.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const before = await app.evaluate(() => Math.round(window.scrollY));

    const names = await page.names();
    await page.openDetail(names[names.length - 1]);
    await expect(app).toHaveURL(/\/customers\/\d+$/);

    await app.goBack();
    await expect.poll(() => app.evaluate(() => Math.round(window.scrollY))).toBe(before);
  });
});
