import { test, expect } from "../fixtures";

test.describe("설정", () => {
  test("외부 연동이 범위 밖임을 밝힌다", async ({ app }) => {
    await app.goto("/settings");

    await expect(app.getByTestId("settings-avg-ticket")).toBeVisible();
    await expect(app.getByText("데모 범위 밖")).toBeVisible();
  });

  test("객단가를 바꾸면 저장된다", async ({ app }) => {
    await app.goto("/settings");

    await app.getByTestId("settings-avg-ticket").fill("15000");
    await app.getByTestId("settings-save").click();

    await app.reload();
    await expect(app.getByTestId("settings-avg-ticket")).toHaveValue("15000");
  });

  test("연동 키 입력칸은 실제 값을 넣으라고 요구하지 않는다", async ({ app }) => {
    // 클라이언트에 API 키를 저장하는 구조라, 화면이 '저장까지만 동작한다'는
    // 사실을 밝히고 있는지 확인한다. 밝히지 않으면 진짜 키를 넣는 사람이 생긴다.
    await app.goto("/settings");
    await expect(app.getByText(/입력값 저장까지만/)).toBeVisible();
  });
});
