<script setup lang="ts">
/** 대시보드 — KPI · 차트 3종 · 최근 문의. 드릴다운은 해당 목록 화면으로 보낸다. */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { EzBadge } from '@ezwel/ui'
import EzChart from '../app/EzChart.vue'
import QueryState from '../app/QueryState.vue'
import { useMockQuery } from '../app/useMockQuery'
import { makeInquiries, STATUS_TONE } from '@fixtures/inquiries'
import { makeOrders } from '@fixtures/orders'
import { won } from '@fixtures/rng'

const router = useRouter()
const inquiries = makeInquiries(320)
const orders = makeOrders(500)

/** 대시보드도 넷을 통과한다 — 위젯이 비동기인데 로딩을 안 그리면 첫 화면이 빈 판이 된다 */
const { loading, error, reload } = useMockQuery(() => [1], { latency: 500 })
onMounted(reload)

const kpis = computed(() => [
  { label: '오늘 주문', value: won(orders.length), unit: '건', delta: '+12.4%', up: true },
  { label: '결제 금액', value: won(Math.round(orders.reduce((s, o) => s + o.amount, 0) / 10000)), unit: '만원', delta: '+8.1%', up: true },
  { label: '미답변 문의', value: won(inquiries.filter((i) => i.status === '접수' || i.status === '처리중').length), unit: '건', delta: '-3.0%', up: false },
  { label: 'SLA 초과', value: won(inquiries.filter((i) => i.slaLeft < 0).length), unit: '건', delta: '+5건', up: false, danger: true },
])

const days = Array.from({ length: 14 }, (_, i) => `9/${i + 6}`)

const trend = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['주문', '취소'] },
  xAxis: { type: 'category', data: days },
  yAxis: { type: 'value' },
  series: [
    { name: '주문', type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: days.map((_, i) => 120 + ((i * 37) % 90)) },
    { name: '취소', type: 'line', smooth: true, data: days.map((_, i) => 12 + ((i * 13) % 22)) },
  ],
}

const byChannel = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  grid: { top: 10, bottom: 40 },
  series: [
    {
      type: 'pie', radius: ['48%', '72%'], avoidLabelOverlap: true,
      label: { show: false }, labelLine: { show: false },
      data: ['웹', '앱', '전화', '카카오', '이메일'].map((name) => ({
        name, value: inquiries.filter((i) => i.channel === name).length,
      })),
    },
  ],
}

const byCategory = {
  tooltip: { trigger: 'axis' },
  grid: { left: 70, top: 10, bottom: 24 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: ['배송', '환불', '결제', '쿠폰', '포인트'] },
  series: [
    {
      type: 'bar', barWidth: 14,
      data: ['배송', '환불', '결제', '쿠폰', '포인트'].map((c) => inquiries.filter((i) => i.category === c).length),
    },
  ],
}

const recent = computed(() => inquiries.slice(0, 6))
</script>

<template>
  <!-- 여유 밀도 — 위젯 몇 개가 전부인 화면이다. 목록·폼에는 걸지 않는다 -->
  <div class="pg" data-density="comfortable">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">대시보드</h1>
        <p class="pg__sub">2026-09-19 기준 · 최근 14일</p>
      </div>
      <div class="pg__actions">
        <Button label="통계 자세히" severity="secondary" outlined size="small" @click="router.push('/stats')" />
      </div>
    </header>

    <QueryState :loading="loading" :error="error" :lines="4" @retry="reload">
    <div class="grid4">
      <div v-for="k in kpis" :key="k.label" class="kpi">
        <p class="kpi__label">{{ k.label }}</p>
        <p class="kpi__value" :class="{ 'kpi__value--danger': k.danger }">
          {{ k.value }}<span class="kpi__unit">{{ k.unit }}</span>
        </p>
        <!-- 증감은 화살표 + 부호로 읽힌다. 색만으로 방향을 알리지 않는다 -->
        <p class="kpi__delta" :class="k.up ? 'kpi__delta--up' : 'kpi__delta--down'">
          {{ k.up ? '▲' : '▼' }} {{ k.delta }}
        </p>
      </div>
    </div>
    </QueryState>

    <!-- 폭을 2:1 로 나눠 무게를 준다. 다 같은 폭이면 무엇이 중요한지 안 보인다 -->
    <div class="grid21">
      <section class="card">
        <h2 class="card__title">주문·취소 추이</h2>
        <EzChart :option="trend" height="280px" />
      </section>

      <section class="card">
        <h2 class="card__title">문의 채널 구성</h2>
        <EzChart :option="byChannel" height="280px" />
      </section>
    </div>

    <div class="grid12">
      <section class="card">
        <h2 class="card__title">문의 분류별 건수</h2>
        <EzChart :option="byCategory" height="260px" />
      </section>

      <section class="card">
      <div class="card__head">
        <h2 class="card__title" style="margin: 0">최근 문의</h2>
        <Button label="전체 보기" text size="small" @click="router.push('/cs/inquiries')" />
      </div>
      <table class="mini">
        <caption class="ez-sr-only">최근 접수된 문의 6건</caption>
        <thead>
          <tr><th scope="col">문의번호</th><th scope="col">제목</th><th scope="col">담당자</th><th scope="col">상태</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in recent" :key="r.id">
            <td class="mini__id">{{ r.id }}</td>
            <td class="ez-truncate">{{ r.title }}</td>
            <td>{{ r.assignee }}</td>
            <td><EzBadge :tone="(STATUS_TONE[r.status] as any)">{{ r.status }}</EzBadge></td>
          </tr>
        </tbody>
      </table>
      </section>
    </div>
  </div>
</template>

<style scoped>
.kpi {
  padding: var(--ez-card-padding);
  background: var(--ez-surface-default);
  border: var(--ez-card-border-width) solid var(--ez-border-default);
  border-radius: var(--ez-card-radius);
  box-shadow: var(--ez-card-shadow);
}

/* 라벨을 낮추고 값을 올린다. 위계가 크기 대비만으로 선다 */
.kpi__label { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
.kpi__value {
  margin: var(--ez-space-3) 0 0;
  font-size: var(--ez-font-size-3xl);
  font-weight: var(--ez-font-weight-bold);
  line-height: var(--ez-line-height-tight);
  color: var(--ez-text-strong);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.kpi__value--danger { color: var(--ez-text-danger); }
.kpi__unit { margin-left: 3px; font-size: var(--ez-font-size-xs); font-weight: var(--ez-font-weight-regular); color: var(--ez-text-muted); }
.kpi__delta { margin: var(--ez-space-2) 0 0; font-size: var(--ez-font-size-2xs); }
.kpi__delta--up { color: var(--ez-text-success); }
.kpi__delta--down { color: var(--ez-text-danger); }

.card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--ez-gap-intra); }

.mini { width: 100%; border-collapse: collapse; font-size: var(--ez-font-size-xs); table-layout: fixed; }
.mini th, .mini td { padding: var(--ez-gap-intra) var(--ez-gap-intra); text-align: left; border-bottom: 1px solid var(--ez-border-subtle); }
.mini th { color: var(--ez-text-muted); font-weight: var(--ez-font-weight-medium); }
.mini tbody tr:last-child td { border-bottom: none; }
/* 열 너비는 내용이 정한다 — 고정 px 은 글자 확대에서 잘린다 */
.mini__id { width: 9ch; font-variant-numeric: tabular-nums; }
.mini th:nth-child(3), .mini td:nth-child(3) { width: 7ch; }
.mini th:nth-child(4), .mini td:nth-child(4) { width: 8ch; }
</style>
