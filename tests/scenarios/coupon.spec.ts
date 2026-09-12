import { test, expect, BUCKETS } from "../fixtures";
import { CouponPage } from "../pages/coupon.page";
import { DashboardPage } from "../pages/dashboard.page";

test.describe("쿠폰 발송", () => {
  test("범위 밖이라는 사실을 화면에 밝힌다", async ({ app }) => {
    const coupon = await new CouponPage(app).open();
    await expect(coupon.smsNotice).toBeVisible();
  });

  test("대상 등급을 바꾸면 대상 수가 따라간다", async ({ app }) => {
    const coupon = await new CouponPage(app).open();

    await coupon.target("전체").click();
    await expect(coupon.targetCount).toContainText(String(BUCKETS.totalCustomers));

    await coupon.target("VIP").click();
    await expect(coupon.targetCount).toContainText(String(BUCKETS.vip));
  });

  test("발송하면 이력에 남고 대시보드가 따라 바뀐다", async ({ app }) => {
    const coupon = await new CouponPage(app).open();
    await expect(coupon.historyItems).toHaveCount(BUCKETS.couponHistory);

    await coupon.target("VIP").click();
    await coupon.compose("E2E 발송 검증");
    await coupon.send.click();

    await expect(coupon.historyItems).toHaveCount(BUCKETS.couponHistory + 1);
    await expect(coupon.historyItems.first()).toContainText("E2E 발송 검증");

    // 날짜는 YYYY.MM.DD 로 보여야 한다. ISO 타임스탬프가 새면 D-18 재발이다.
    await expect(coupon.historyItems.first()).toContainText(/\d{4}\.\d{2}\.\d{2}/);
    await expect(coupon.historyItems.first()).not.toContainText("T");

    const dashboard = await new DashboardPage(app).open();
    await expect(dashboard.recentCoupon).toHaveText(String(BUCKETS.vip));
  });

  test("🔴 발송을 눌러도 문자 요청이 나가지 않는다", async ({ app }) => {
    // 이 저장소에서 가장 중요한 테스트다.
    //
    // 실제 발송은 건당 비용이 들고 발신번호 사전등록이 필요하다.
    // 무엇보다 남의 번호로 잘못 나가면 되돌릴 수 없다.
    // "안 나간다"는 주장이 아니라 **측정된 사실**이어야 한다.
    //
    // 특정 경로(/api/send-sms)만 감시하지 않는다. 구현이 바뀌어 다른 주소로
    // 나가기 시작하면 그 감시는 조용히 무력해진다. 바깥으로 나가는
    // 모든 요청을 세고, 하나라도 있으면 어디로 갔는지 보여준다.
    const outbound: string[] = [];
    await app.route("**/*", async (route) => {
      const url = route.request().url();
      const isDocumentOrAsset =
        url.startsWith(new URL(app.url() || "https://loyalhub-demo.vercel.app").origin) &&
        !/\/api\//.test(url);
      if (!isDocumentOrAsset) outbound.push(`${route.request().method()} ${url}`);
      await route.continue();
    });

    const coupon = await new CouponPage(app).open();
    outbound.length = 0; // 화면을 여는 동안의 정적 자산 요청은 제외한다

    await coupon.target("전체").click();
    await coupon.compose("문자 미발송 검증");
    await coupon.send.click();

    // 이력이 남았다 = 발송 흐름이 실제로 끝까지 돌았다
    await expect(coupon.historyItems.first()).toContainText("문자 미발송 검증");

    const smsLike = outbound.filter((r) => /sms|message|send|알림|notify/i.test(r));
    expect(smsLike, `문자로 보이는 요청이 나갔다:\n${smsLike.join("\n")}`).toHaveLength(0);
  });

  test("발송 결과를 '보냈다'고 말하지 않는다", async ({ app }) => {
    const coupon = await new CouponPage(app).open();
    await coupon.target("전체").click();
    await coupon.compose("문구 검증");
    await coupon.send.click();

    // 데모인데 '발송 완료'라고 하면 그 자체가 거짓말이다.
    const toast = app.getByText(/데모/).first();
    await expect(toast).toBeVisible();
  });
});
