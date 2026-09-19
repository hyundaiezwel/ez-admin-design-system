import type { Sample } from './measure'

/**
 * 두 스파이크가 **같은 지점**을 잰다. 선택자는 `data-m` 속성으로 붙여
 * 라이브러리별 클래스 이름에 의존하지 않게 했다.
 *
 * `need`는 WCAG AA 하한이다 — 본문 4.5:1, 큰 글씨·UI 요소 3:1.
 */
export const SAMPLES: Sample[] = [
  { label: '페이지 타이틀', selector: '[data-m="title"]', need: 3 },
  { label: '본문 텍스트', selector: '[data-m="body"]', need: 4.5 },
  { label: '보조 텍스트', selector: '[data-m="muted"]', need: 4.5 },
  { label: '필드 라벨', selector: '[data-m="label"]', need: 4.5 },
  { label: '주 버튼(흰 글자)', selector: '[data-m="btn-primary"]', need: 4.5 },
  { label: '보조 버튼', selector: '[data-m="btn-secondary"]', need: 4.5 },
  { label: '위험 버튼', selector: '[data-m="btn-danger"]', need: 4.5 },
  { label: '입력 텍스트', selector: '[data-m="input"]', need: 4.5 },
  { label: '뱃지 info', selector: '[data-m="badge-info"]', need: 4.5 },
  { label: '뱃지 success', selector: '[data-m="badge-success"]', need: 4.5 },
  { label: '뱃지 warning', selector: '[data-m="badge-warning"]', need: 4.5 },
  { label: '뱃지 danger', selector: '[data-m="badge-danger"]', need: 4.5 },
  { label: '그리드 헤더', selector: '.ez-grid .tabulator-col-title', need: 4.5 },
  // 범위선택 모듈이 첫 컬럼을 행 헤더 거터로 바꾼다 — 데이터 셀만 잰다
  { label: '그리드 셀', selector: '.ez-grid .tabulator-cell:not(.tabulator-range-row-header)', need: 4.5 },
  { label: '그리드 뱃지(SLA)', selector: '.ez-grid .g-badge--danger', need: 4.5 },
]

/** 밀도 측정 — 우리 규격은 sm 28 / md 34 / lg 40px이다 */
export const DENSITY_TARGETS = [
  { label: '주 버튼 높이', selector: '[data-m="btn-primary"]', expect: 34 },
  { label: '입력 높이', selector: '[data-m="input"]', expect: 34 },
  { label: '셀렉트 높이', selector: '[data-m="select"]', expect: 34 },
  { label: '그리드 행 높이', selector: '.ez-grid .tabulator-row', expect: 34 },
]
