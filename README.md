# EZ Admin Design System

`@ezwel/ui` 디자인 시스템 위에 올린 어드민 목업. 어드민 화면에 필요한 요소가
실제로 물리는지 확인하는 것이 목적이다.

- 페이지 구성안 — [`docs/pages.md`](docs/pages.md)
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
