<script setup lang="ts">
/**
 * 통계 — 차트 전 종류 + 표·차트 병치.
 *
 * `aria.decal` 토글이 이 화면의 핵심이다. 켜면 계열마다 패턴이 입혀져 색 없이도 구분된다.
 * 접근성 문서의 "색에만 기대지 않기"가 차트에서 늘 깨지는데, ECharts는 이걸 기본 제공한다.
 */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import ToggleSwitch from 'primevue/toggleswitch'
import EzChart from '../app/EzChart.vue'
import { makeOrders } from '@fixtures/orders'
import { won } from '@fixtures/rng'

const RANGES = ['7일', '14일', '30일', '90일']
const range = ref('30일')
const decal = ref(true)

const days = computed(() => {
  const n = Number(range.value.replace('일', ''))
  return Array.from({ length: n }, (_, i) => `${Math.floor(i / 30) + 8}/${(i % 30) + 1}`)
})

const orders = makeOrders(600)
const CHANNELS = ['웹', '앱', '제휴몰']
const CATEGORIES = ['상품권', '건강', '여행', '문화', '도서']

const stacked = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: CHANNELS },
  xAxis: { type: 'category', data: days.value },
  yAxis: { type: 'value' },
  series: CHANNELS.map((name, ci) => ({
    name, type: 'bar', stack: 'total', barMaxWidth: 20,
    data: days.value.map((_, i) => 30 + ((i * (7 + ci * 5)) % 60)),
  })),
}))

const combo = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['매출', '건수'] },
  xAxis: { type: 'category', data: days.value },
  yAxis: [
    { type: 'value', name: '매출(만원)' },
    { type: 'value', name: '건수', splitLine: { show: false } },
  ],
  series: [
    { name: '매출', type: 'bar', barMaxWidth: 18, data: days.value.map((_, i) => 800 + ((i * 53) % 700)) },
    { name: '건수', type: 'line', yAxisIndex: 1, smooth: true, data: days.value.map((_, i) => 40 + ((i * 11) % 50)) },
  ],
}))

const donut = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  grid: { top: 10, bottom: 40 },
  series: [{ type: 'pie', radius: ['45%', '70%'], label: { show: false }, data: CATEGORIES.map((name, i) => ({ name, value: 120 + i * 47 })) }],
}

/** 요일 × 시간대 히트맵. 색 하나로만 값을 나르므로 visualMap 범례를 반드시 같이 둔다 */
const heat = {
  tooltip: { position: 'top' },
  grid: { left: 48, right: 16, top: 10, bottom: 56 },
  xAxis: { type: 'category', data: Array.from({ length: 12 }, (_, i) => `${i * 2}시`), splitArea: { show: true } },
  yAxis: { type: 'category', data: ['월', '화', '수', '목', '금', '토', '일'], splitArea: { show: true } },
  visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, itemHeight: 90 },
  series: [{
    type: 'heatmap',
    data: Array.from({ length: 7 }, (_, d) => Array.from({ length: 12 }, (_, h) => [h, d, (d * 17 + h * 13) % 100])).flat(),
    label: { show: false },
  }],
}

const table = computed(() =>
  CATEGORIES.map((c, i) => {
    const amount = 12000000 + i * 3400000
    return { category: c, count: 120 + i * 47, amount, avg: Math.round(amount / (120 + i * 47)) }
  }),
)
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">통계</h1>
        <p class="pg__sub">기간 · 채널 · 분류별 집계 — 표와 차트를 나란히 둔다</p>
      </div>
      <div class="pg__actions">
        <SelectButton v-model="range" :options="RANGES" :allow-empty="false" size="small" aria-label="조회 기간" />
        <Button label="엑셀 내려받기" severity="secondary" outlined size="small" />
      </div>
    </header>

    <div class="card decal">
      <ToggleSwitch v-model="decal" input-id="decal" />
      <label for="decal" class="decal__label">
        <b>색 외 단서(패턴) 표시</b>
        <span>계열마다 다른 패턴이 입혀진다. 적록색약 사용자도 계열을 구분할 수 있다.</span>
      </label>
    </div>

    <div class="grid2">
      <section class="card" style="grid-column: span 2">
        <h2 class="card__title">채널별 주문 추이 (누적 막대)</h2>
        <EzChart :option="stacked" :decal="decal" height="280px" />
      </section>

      <section class="card" style="grid-column: span 2">
        <h2 class="card__title">매출·건수 (콤보)</h2>
        <EzChart :option="combo" :decal="decal" height="280px" />
      </section>

      <section class="card">
        <h2 class="card__title">분류 구성 (도넛)</h2>
        <EzChart :option="donut" :decal="decal" height="260px" />
      </section>

      <section class="card">
        <h2 class="card__title">요일·시간대 주문 밀도 (히트맵)</h2>
        <EzChart :option="heat" :decal="false" height="260px" />
      </section>
    </div>

    <section class="card">
      <h2 class="card__title">분류별 집계</h2>
      <table class="st">
        <caption class="ez-sr-only">분류별 주문 건수와 매출</caption>
        <thead>
          <tr><th scope="col">분류</th><th scope="col" class="num">건수</th><th scope="col" class="num">매출</th><th scope="col" class="num">건단가</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in table" :key="r.category">
            <td>{{ r.category }}</td>
            <td class="num">{{ won(r.count) }}</td>
            <td class="num">{{ won(r.amount) }}원</td>
            <td class="num">{{ won(r.avg) }}원</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">합계</th>
            <td class="num">{{ won(table.reduce((s, r) => s + r.count, 0)) }}</td>
            <td class="num">{{ won(table.reduce((s, r) => s + r.amount, 0)) }}원</td>
            <td class="num">—</td>
          </tr>
        </tfoot>
      </table>
    </section>
  </div>
</template>

<style scoped>
.decal { display: flex; align-items: flex-start; gap: var(--ez-space-3); }
.decal__label { display: flex; flex-direction: column; gap: 2px; font-size: var(--ez-font-size-xs); cursor: pointer; }
.decal__label span { color: var(--ez-text-muted); }

.st { width: 100%; border-collapse: collapse; font-size: var(--ez-font-size-xs); }
.st th, .st td { padding: var(--ez-space-2) var(--ez-space-3); text-align: left; border-bottom: 1px solid var(--ez-border-subtle); }
.st thead th { color: var(--ez-text-muted); font-weight: var(--ez-font-weight-medium); }
.st .num { text-align: right; font-variant-numeric: tabular-nums; }
.st tfoot th, .st tfoot td { border-top: 2px solid var(--ez-border-default); border-bottom: none; font-weight: var(--ez-font-weight-bold); color: var(--ez-text-strong); }
</style>
