<script setup lang="ts">
/**
 * 주문·정산 관리 — 대용량 + 합계 행 + 컬럼 고정.
 *
 * 행 수를 바꿔 가며 가상 렌더를 확인하는 자리다. 30만 행에서도 스크롤이 끊기지 않아야 한다.
 */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import { notify } from '@ezwel/ui'
import TabGrid from '@shared/grid/TabGrid.vue'
import { makeOrders, ORDER_STATUS, ORDER_STATUS_TONE, ORDER_CHANNELS } from '@fixtures/orders'
import { won } from '@fixtures/rng'

const SIZES = [1000, 30000, 100000, 300000]
const size = ref(1000)
const keyword = ref('')
const status = ref<string | null>(null)
const channel = ref<string | null>(null)
const applied = ref({ keyword: '', status: '', channel: '' })
const selectedCount = ref(0)
const loading = ref(false)

const source = computed(() => makeOrders(size.value))

const rows = computed(() =>
  source.value.filter((o) => {
    const f = applied.value
    return (
      (!f.keyword || o.id.includes(f.keyword) || o.customer.includes(f.keyword) || o.product.includes(f.keyword)) &&
      (!f.status || o.status === f.status) &&
      (!f.channel || o.channel === f.channel)
    )
  }),
)

const sum = computed(() => rows.value.reduce((s, o) => ({ amount: s.amount + o.amount, fee: s.fee + o.fee, settle: s.settle + o.settle }), { amount: 0, fee: 0, settle: 0 }))

const money = (c: any) => won(Number(c.getValue()))

const columns = [
  { title: '주문번호', field: 'id', width: 128, sorter: 'string', headerFilter: 'input', frozen: true },
  { title: '주문일시', field: 'orderedAt', width: 138, sorter: 'string' },
  { title: '고객', field: 'customer', width: 90, sorter: 'string', headerFilter: 'input' },
  { title: '상품', field: 'product', minWidth: 170, sorter: 'string' },
  { title: '수량', field: 'qty', width: 68, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number' },
  { title: '결제금액', field: 'amount', width: 118, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number', formatter: money },
  { title: '수수료', field: 'fee', width: 104, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number', formatter: money },
  { title: '정산금액', field: 'settle', width: 118, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number', formatter: money },
  { title: '채널', field: 'channel', width: 78, sorter: 'string' },
  { title: '상태', field: 'status', width: 92, hozAlign: 'center', headerHozAlign: 'center', sorter: 'string',
    formatter: (c: any) => `<span class="g-badge g-badge--${ORDER_STATUS_TONE[c.getValue() as keyof typeof ORDER_STATUS_TONE]}">${c.getValue()}</span>` },
]

const grid = ref<InstanceType<typeof TabGrid> | null>(null)

function search() {
  loading.value = true
  applied.value = { keyword: keyword.value, status: status.value ?? '', channel: channel.value ?? '' }
  setTimeout(() => (loading.value = false), 150)
}
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">주문·정산 관리</h1>
        <p class="pg__sub">대용량 가상 렌더 · 합계 행 · 주문번호 컬럼 고정</p>
      </div>
      <div class="pg__actions">
        <Button label="엑셀 내려받기" severity="secondary" outlined size="small" @click="grid?.exportCsv('orders'); notify('조회 결과 전체를 내려받습니다', 'info')" />
      </div>
    </header>

    <form class="sfb" @submit.prevent="search">
      <div class="sfb__fields">
        <div class="field" style="min-width: 220px">
          <label class="field__label" for="o-kw">검색어</label>
          <InputText id="o-kw" v-model="keyword" placeholder="주문번호 · 고객 · 상품" fluid />
        </div>
        <div class="field">
          <label class="field__label" for="o-st">상태</label>
          <Select id="o-st" v-model="status" :options="[...ORDER_STATUS]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="o-ch">채널</label>
          <Select id="o-ch" v-model="channel" :options="[...ORDER_CHANNELS]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <span class="field__label">데이터 규모</span>
          <SelectButton v-model="size" :options="SIZES" :allow-empty="false" aria-labelledby="size" size="small" />
        </div>
      </div>
      <div class="sfb__actions">
        <Button label="조회" type="submit" size="small" :loading="loading" />
      </div>
    </form>

    <div class="toolbar">
      <span>총 <b>{{ rows.length.toLocaleString('ko-KR') }}</b>건</span>
      <span style="color: var(--ez-text-muted)">선택 {{ selectedCount }}건</span>
    </div>

    <TabGrid :columns="columns" :rows="rows" editable height="440px" @selection-change="selectedCount = $event" />

    <!-- 합계는 그리드 밖에 둔다. Tabulator의 columnCalcs와 가상 렌더를 같이 쓰면
         스크롤 중 합계가 깜빡이는 문제가 있어 목록과 분리했다 -->
    <div class="sum">
      <div><span>결제금액 합계</span><b>{{ won(sum.amount) }}원</b></div>
      <div><span>수수료 합계</span><b>{{ won(sum.fee) }}원</b></div>
      <div class="sum--strong"><span>정산금액 합계</span><b>{{ won(sum.settle) }}원</b></div>
    </div>
  </div>
</template>

<style scoped>
.sum {
  display: flex;
  gap: var(--ez-space-6);
  padding: var(--ez-space-3) var(--ez-space-4);
  background: var(--ez-surface-sunken);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-lg);
  font-size: var(--ez-font-size-xs);
}
.sum > div { display: flex; gap: var(--ez-space-2); align-items: baseline; }
.sum span { color: var(--ez-text-muted); }
.sum b { font-variant-numeric: tabular-nums; color: var(--ez-text-strong); }
.sum--strong { margin-left: auto; }
.sum--strong b { color: var(--ez-text-brand); font-size: var(--ez-font-size-md); }
</style>
