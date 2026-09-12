# loyalhub-e2e

**[LoyalHub](https://loyalhub-demo.vercel.app) 를 대상으로 한 Playwright E2E 자동화.**

대상 앱도 내가 만들었습니다([changmindev/sideproject](https://github.com/changmindev/sideproject)).
그래서 **테스트가 요구하는 것을 제품에 반영할 수 있습니다** — 셀렉터를 추측하지 않고 계약으로 고정하고,
시드 데이터를 결정적으로 만들고, 실패를 일부러 주입할 수 있습니다.

> 통제할 수 없는 외부 사이트를 대상으로 한 E2E 는 별도 저장소에 있습니다 → [playwright-e2e](https://github.com/changmindev/playwright-e2e)

---

## 이 저장소가 보여주려는 것

| | |
|---|---|
| **셀렉터 계약** | `data-testid` 를 제품과 테스트가 합의한 인터페이스로 다룹니다. 클래스명·텍스트에 기대지 않습니다 |
| **결정적 시드** | 시드 날짜가 실행 시점 기준 상대값이라, 언제 돌려도 각 세그먼트에 검증 대상이 존재합니다 |
| **실패 주입** | 네트워크를 가로채 실패시키고, **에러가 사용자에게 드러나는지**를 검증합니다 |
| **환경 분리** | 같은 테스트 코드로 로컬 dev 서버와 배포본을 모두 겨냥합니다 (`baseURL` 파라미터화) |

---

## 상태

🚧 **구성 중.** 시나리오는 대상 앱의 [`docs/E2E.md`](https://github.com/changmindev/sideproject/blob/main/docs/E2E.md) 에 정의돼 있고, PR 단위로 들어옵니다.

- [ ] `playwright.config.ts` — `baseURL` 환경변수화 (로컬 / 배포본)
- [ ] 인증 · 고객 목록 · 세그먼트 · 쿠폰 발송 시나리오
- [ ] 실패 주입 시나리오
- [ ] GitHub Actions CI

---

## 실행

```bash
npm install
npx playwright install chromium

npx playwright test                                    # 기본 대상
BASE_URL=http://localhost:8080 npx playwright test     # 로컬 dev 서버 대상
```

---

## 스택

```
TypeScript · @playwright/test · Page Object Model
```

🔴 **문자·알림톡은 대상 앱에서 범위 밖**이라 검증하지 않습니다.
데모 모드에서는 프런트엔드가 네트워크 요청 자체를 만들지 않으므로, 실수로 발송될 경로가 없습니다.
