# loyalhub-e2e

[LoyalHub](https://loyalhub-demo.vercel.app) 배포본을 대상으로 한 Playwright E2E 테스트.

```
27 tests — 27 passed   (Chromium headless · 로컬 5~6초, CI E2E 단계 약 15초)
```

대상 앱도 내 저장소입니다([changmindev/loyalhub](https://github.com/changmindev/loyalhub)).
AI 빌더로 세운 화면을 직접 정비해 왔기 때문에, 테스트에 필요한 것을 제품 쪽에 반영할 수 있습니다.
셀렉터를 추측하지 않고 계약으로 고정했고, 시드를 결정적으로 만들었고, 테스트가 깨졌을 때 제품 결함인지 판정할 수 있습니다.

> 통제할 수 없는 외부 사이트를 대상으로 한 E2E 는 별도 저장소에 있습니다 → [playwright-e2e](https://github.com/changmindev/playwright-e2e)
> 두 저장소는 CI 판단이 정반대라 나눴습니다(아래 참고).

---

## 실행

```bash
npm install
npx playwright install chromium

npm test                  # 배포본 대상
npm run test:local        # 로컬 dev 서버 대상 (BASE_URL=http://localhost:8080)
npm run test:ui           # Playwright UI 모드
npm run report            # 마지막 실행 리포트
```

대상은 `BASE_URL` 로 바꿉니다. 배포본만 보면 머지 전에 확인할 방법이 없고,
로컬만 보면 실제로 배포된 것을 확인할 방법이 없어서 같은 코드가 둘 다 겨냥하게 했습니다.

---

## 무엇을 검증하는가

| 파일 | 건수 | 내용 |
|---|---|---|
| `auth.spec.ts` | 4 | 데모 로그인 · 빈 값 차단 · 보호 라우트 4개 직접 진입 차단 · 새로고침 후 유지 |
| `dashboard.spec.ts` | 4 | 지표 5종이 시드 버킷과 일치 · 데모 배너 · ISO 날짜 노출 금지 · CTA 딥링크 |
| `customers.spec.ts` | 8 | 세그먼트 4종 딥링크 · 탭 클릭과 URL 진입의 결과 동일 · '방문 전' 분리 · 스크롤 위치 |
| `coupon.spec.ts` | 5 | 대상 수 산정 · 발송 → 이력 → 대시보드 반영 · 문자 미발송 · '보냈다'고 말하지 않는 결과 문구 |
| `resilience.spec.ts` | 3 | 시드 복구 · 깨진 localStorage · 자산 로드 실패 시 흰 화면 방지 |
| `settings.spec.ts` | 3 | 범위 밖 표시 · 객단가 저장 · 연동 키 안내 |

### 가장 중요한 테스트

```ts
test("🔴 발송을 눌러도 문자 요청이 나가지 않는다", ...)
```

실제 발송은 건당 비용이 들고 발신번호 사전등록이 필요합니다. 무엇보다 남의 번호로
잘못 나가면 되돌릴 수 없습니다. 그래서 "안 나간다"를 주장이 아니라 측정으로 확인합니다.

특정 경로(`/api/send-sms`)만 감시하지 않습니다. 구현이 바뀌어 다른 주소로 나가기 시작하면
그런 감시는 조용히 무력해지기 때문입니다. 발송 중 나가는 요청을 전부 기록하고,
그중 문자 발송으로 보이는 주소(`sms`·`message`·`send`·`notify` 등)가 하나라도 있으면
어디로 갔는지 출력하며 실패합니다. 동시에 발송 이력이 남았는지도 확인해서,
"아무 일도 일어나지 않아서" 통과한 경우와 구분합니다.

---

## 설계에서 신경 쓴 것

- **제품에 테스트 전용 훅을 넣지 않았습니다.** `window.__test` 같은 걸 만들면 그게 곧 운영 코드가 됩니다.
  `localStorage` 키와 `data-testid` 계약만으로 충분합니다.
  계약 원문은 대상 앱의 [`docs/E2E.md`](https://github.com/changmindev/loyalhub/blob/main/docs/E2E.md) 에 있습니다.
- **상태는 클래스가 아니라 속성으로 읽습니다.** 세그먼트 탭은 `aria-pressed`, 위험도는 `data-risk-level`.
  Tailwind 클래스에 기대면 디자인을 손대는 순간 테스트가 조용히 깨집니다. 제품 쪽 결함(D-21)으로 잡아 고쳤습니다.
- **날짜가 아니라 버킷 인원수를 검증합니다.** 시드 날짜가 실행 시점 기준 상대값이라, 날짜를 박아두면 다음 날 깨집니다.
- **시드는 페이지 로드 전에 심습니다.** `demoStore` 는 모듈 로드 시점에 `localStorage` 를 한 번만 읽기 때문에
  로드 후에 바꾸면 반영되지 않습니다. 그래서 `addInitScript` 를 씁니다.
- **재시도는 0 입니다.** 재시도를 켜면 두 번째에 통과한 테스트도 초록으로 보고되고,
  그때부터 플래키와 진짜 결함을 구분할 수 없습니다. 불안정하면 덮지 않고 원인을 고칩니다.

---

## CI 는 테스트를 실제로 실행합니다

[playwright-e2e](https://github.com/changmindev/playwright-e2e) 와 반대 판단입니다.

거기는 대상이 통제할 수 없는 외부 사이트라, 해외 IP 러너에서 돌리면 내 코드가
멀쩡해도 빨간불이 뜹니다. 그래서 구조 검사만 합니다.

여기는 대상 앱도 내 저장소이고 배포본이 늘 같은 시드로 뜹니다. 결과가 재현되므로
깨지면 실제 회귀로 봅니다. push·PR 마다 전부 돌리고, 매일 한 번 스케줄로도 돌립니다.
이 저장소를 건드리지 않아도 대상 앱이 바뀌면 깨질 수 있어서, 언제부터 깨졌는지 알아야 하기 때문입니다.
실행마다 Playwright HTML 리포트가 아티팩트로 7일간 남고, 실패한 테스트는 trace·스크린샷·영상이 함께 들어갑니다.

---

## 스택

```
TypeScript · @playwright/test · Page Object Model · GitHub Actions (Node 22)
```

문자·알림톡은 대상 앱에서 범위 밖이라 발송 자체는 검증하지 않습니다.
검증하는 것은 발송되지 않는다는 사실입니다.
