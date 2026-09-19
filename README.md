# EZ Admin Design System

`@ezwel/ui` 디자인 시스템 위에 올린 어드민 목업. 어드민 화면에 필요한 요소가
실제로 물리는지 확인하는 것이 목적이다.

- 페이지 구성안 — [`docs/pages.md`](docs/pages.md)
- **UI 라이브러리 실측 보고** — [`docs/spike-report.md`](docs/spike-report.md)

## 지금 상태

라이브러리 선정 스파이크까지 끝났다. 본 앱은 아직 없다.

```
fixtures/        시드 고정 목업 데이터 (두 스파이크가 공유)
shared/grid/     Tabulator 래퍼 + PoC에서 가져온 pasteGuard · rowSelect
shared/measure.ts  대비·밀도 계측 (렌더된 픽셀에서 잰다)
spike/nuxt-ui/   Nuxt UI 4.11 판
spike/primevue/  PrimeVue 4.5.5 판
```

## 돌려보기

```bash
npm install
npm run spike:prime   # http://127.0.0.1:5320
npm run spike:nuxt    # http://127.0.0.1:5310
```

브라우저 콘솔에서 `window.__measure()` / `window.__density()`.

## 측정 요약

| | Nuxt UI | PrimeVue |
|---|---|---|
| 대비 실패 (15지점) | 7 | **4** |
| 라이브러리 탓 실패 | 4 | **0** |
| 팔레트 중복 | 있음 | 없음 |
| 다크 브리지 | 필요 | 불필요 |
| 빌드 CSS | 209 KB | **18 KB** |

근거와 함정은 [`docs/spike-report.md`](docs/spike-report.md).

## 그리드

`vue-tabulator-grid-poc`를 그대로 옮기지 않는다. 검증된 두 조각(`pasteGuard`, `rowSelect`)만
가져오고, 화면은 `shared/grid/TabGrid.vue`에 컬럼과 데이터만 넘긴다.
