# EZ Admin Design System

`@ezwel/ui` 디자인 시스템 위에 올린 어드민 목업. 어드민 화면에 필요한 요소가
실제로 물리는지 확인하는 것이 목적이다.

- 페이지 구성안 — [`docs/pages.md`](docs/pages.md)
- **셸 규칙(사이드바·탭)** — [`docs/navigation.md`](docs/navigation.md)
- **UI 라이브러리 실측 보고** — [`docs/spike-report.md`](docs/spike-report.md)

## 지금 상태

**UI 라이브러리는 PrimeVue 4로 확정**했다(2026-09-19). 선행 과제였던 토큰 결함은
`@ezwel/ui` v1.1.0으로 해소했고, 같은 화면 재측정에서 대비 15지점 전부 통과한다.

본 앱은 아직 없다.

**라이브: https://hyundaiezwel.github.io/ez-admin-design-system/**

디자인 시스템 문서 사이트: https://hyundaiezwel.github.io/ez-design-system/

Nuxt UI 판은 배포하지 않는다 — 선정 근거 기록이고 팔레트 사본이 `@ezwel/ui` v1.0.0에
멈춰 있어 나란히 띄우면 어느 쪽이 현재 기준인지 헷갈린다. `spike/nuxt-ui`는 선정 근거 기록으로 남겨 두되 더 갱신하지 않는다
(팔레트 사본이 v1.0.0에 멈춰 있다).

```
app/             어드민 목업 앱 (셸 + 화면 9개)
  src/app/       헤더 · LNB · 탭 바 · 차트 래퍼
  src/layouts/   AppShell · AuthLayout
  src/pages/     화면
fixtures/        시드 고정 목업 데이터
shared/grid/     Tabulator 래퍼 + PoC에서 가져온 pasteGuard · rowSelect
shared/measure.ts  대비·밀도 계측 (렌더된 픽셀에서 잰다)
spike/           라이브러리 선정 스파이크 (기록용, 배포 안 함)
```

## 화면

| 경로 | 화면 | 여기서 확인되는 것 |
|---|---|---|
| `/login` | 로그인 | 폼 검증 · 오류 표시 · 셸 없는 레이아웃 |
| `/` | 대시보드 | KPI · 차트 3종 · 드릴다운 |
| `/cs/inquiries` | 문의 답변 관리 | 편집 그리드 · 범위 복붙 · 답변 패널 · IME 자동완성 |
| `/cs/members` | 회원 관리 | 조회 전용 그리드 · 상세 패널 |
| `/sales/promotions` | 프로모션 등록·관리 | 기간 입력 · 대상 조건 · **상태가 입력을 잠근다** |
| `/sales/orders` | 주문·정산 관리 | 30만 행 가상 렌더 · 합계 · 컬럼 고정 |
| `/sales/products` | 상품 등록 | 입력 타입 풀세트 · 미저장 이탈 확인 |
| `/stats` | 통계 | 차트 전 종류 · `aria.decal` 토글 |
| `/system/catalog` | 컴포넌트 카탈로그 | 토큰·테마·고대비·글자확대 전환 |
| `/system/codes` | 공통코드 | 마스터–디테일 2단 · 뱃지 색의 단일 원천 |

## 톤 — 밀도를 화면 성격별로 가른다

핀테크 대시보드 UI 킷을 톤 기준으로 참고했다(`docs/tone-reference.md`). 색 계열은 이미
같았고 벌어지는 건 **밀도와 위계**였다.

| | 대시보드 · 통계 | 목록 · 폼 |
|---|---|---|
| 밀도 | `data-density="comfortable"` | 기본(compact) |
| 카드 패딩 | 24px | 16px |
| 카드 모서리 | 16px | 12px |
| 카드 분리 | **여백 + 그림자** (테두리 0) | 1px 테두리 |
| KPI 숫자 | `--ez-font-size-3xl` 28px | — |
| 위젯 폭 | 2:1 / 1:2 비대칭 | — |

여유 밀도에서 카드 테두리를 버리는 것이 요점이다 — 여백이 충분하면 선이 필요 없고,
둘을 같이 쓰면 시끄럽다. **목록·폼에는 걸지 않는다.** 행 높이가 커지면 30만 행 그리드에서
한 화면에 여덟 줄이 들어간다.

차트는 **기본 2색**이다(브랜드 + 중립). 계열이 셋 이상일 때만 범주 팔레트를 편다.

셸(헤더·LNB·탭)은 `data-scheme="dark"`로 **부분 다크**다. 본문은 밝은 채로 둔다 —
헤더의 「셸」 버튼으로 끈다.

## WebSquare 구조 이관판 — `/ws`

같은 화면을 **사내 관리자센터(WebSquare 5)의 골격으로** 본다. 헤더의
「WebSquare 구조로 보기」 또는 `#/ws` 로 들어간다.

**화면 컴포넌트는 EZ 셸과 같은 것을 쓴다.** 다른 것은 셸(`layouts/WsShell.vue`)과
스킨 CSS(`styles/websquare.css`)뿐이라 두 구조를 같은 화면으로 비교할 수 있다.

값은 눈대중이 아니라 `websquare-bo-ui/cm/css/{base,contents}.css` 실측이다.

| 항목 | WebSquare | EZ |
|---|---|---|
| 좌측 | **70px 검정 아이콘 레일** + 280px 슬라이드 패널(기본 접힘) | 220px LNB(2depth, 접기) |
| 탭 | 없음 | 멀티 탭 바 |
| 경로 | **우측 상단 float**, 1.5rem | 좌측, 본문 위 |
| 타이틀 | `pgtbox` 2rem/700 | 페이지 머리 |
| 조회영역 | 라벨·입력 가로 쌍, **하단 실선이 콘텐츠 패딩 밖까지 뻗음** | 카드 안에 묶음 |
| 카드 | 없음 — 제목 + 실선 | 테두리 + radius 12 |
| CTA | **파랑 `#348FE2`** | 브랜드 틸 |
| 총건수 | 초록 `#009782` 강조 | 굵게 |
| 그리드 | 헤더 34px `#f3f5f6` · **본문 셀마다 1px 테두리 + radius 6** | 헤더 sunken · 셀 구분선 |
| 기준 폰트 | `html{font-size:10px}` → 본문 1.4rem, `letter-spacing:-0.02rem` | 13px |

차트는 스킨 대상이 아니다 — 색까지 바꾸면 "구조 이관"이 아니라 다른 제품이 된다.

## 돌려보기

```bash
npm install
npm run dev     # http://127.0.0.1:5300
```

스파이크를 다시 돌리려면 `npm run spike:prime` / `npm run spike:nuxt`
(브라우저 콘솔에서 `window.__measure()` / `window.__density()`).

## 측정 요약

| | Nuxt UI | PrimeVue |
|---|---|---|
| 대비 실패 (15지점, `@ezwel/ui` v1.0.0) | 7 | 4 |
| 라이브러리 탓 실패 | 4 | **0** |
| 팔레트 중복 | 있음 | 없음 |
| 다크 브리지 | 필요 | 불필요 |
| 빌드 CSS | 209 KB | **18 KB** |
| **v1.1.0 재측정** | — | **0 실패 (15/15)** |

근거와 함정은 [`docs/spike-report.md`](docs/spike-report.md).

## 그리드

`vue-tabulator-grid-poc`를 그대로 옮기지 않는다. 검증된 두 조각(`pasteGuard`, `rowSelect`)만
가져오고, 화면은 `shared/grid/TabGrid.vue`에 컬럼과 데이터만 넘긴다.
