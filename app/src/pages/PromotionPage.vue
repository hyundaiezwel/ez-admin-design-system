<script setup lang="ts">
/**
 * 프로모션 등록·관리 — 기간 · 대상 조건 · 상태 전이.
 *
 * 이 화면의 요점은 **상태가 입력 가능 항목을 정한다**는 것이다. 규칙을 화면에 흩지 않고
 * fixtures의 `EDITABLE` 표 하나에서 읽는다 — 흩어 두면 "진행 중인데 왜 수정되지"가 난다.
 */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Drawer from 'primevue/drawer'
import Dialog from 'primevue/dialog'
import { EzBadge, notify } from '@ezwel/ui'
import TabGrid from '@shared/grid/TabGrid.vue'
import { makePromotions, PROMO_STATUS, PROMO_KINDS, PROMO_TARGETS, PROMO_STATUS_TONE, EDITABLE, type Promotion } from '@fixtures/promotions'
import { won } from '@fixtures/rng'

const ALL = ref(makePromotions(240))
const status = ref<string | null>(null)
const keyword = ref('')
const applied = ref({ keyword: '', status: '' })

const edit = ref<Promotion | null>(null)
const noEnd = ref(false)
const period = ref<Date[] | null>(null)
const confirmStop = ref(false)

const rows = computed(() =>
  ALL.value.filter((p) => {
    const f = applied.value
    return (!f.keyword || p.name.includes(f.keyword) || p.id.includes(f.keyword)) && (!f.status || p.status === f.status)
  }),
)

/** 현재 편집 대상의 잠금 규칙. 상태가 없으면 전부 잠근다 */
const lock = computed(() => (edit.value ? EDITABLE[edit.value.status] : EDITABLE.종료))

const columns = [
  { title: '프로모션 ID', field: 'id', width: 112, sorter: 'string', headerFilter: 'input' },
  { title: '프로모션명', field: 'name', minWidth: 220, sorter: 'string', headerFilter: 'input' },
  { title: '유형', field: 'kind', width: 82, sorter: 'string' },
  { title: '대상', field: 'target', width: 130, sorter: 'string' },
  { title: '시작일', field: 'startAt', width: 104, sorter: 'string' },
  { title: '종료일', field: 'endAt', width: 104, sorter: 'string',
    formatter: (c: any) => c.getValue() ?? '<span style="color:var(--ez-text-muted)">종료일 없음</span>' },
  { title: '예산', field: 'budget', width: 118, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number', formatter: (c: any) => won(c.getValue()) },
  { title: '집행률', field: 'used', width: 92, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number',
    formatter: (c: any) => `${Math.round((c.getValue() / c.getRow().getData().budget) * 100)}%` },
  { title: '상태', field: 'status', width: 92, hozAlign: 'center', headerHozAlign: 'center', sorter: 'string',
    formatter: (c: any) => `<span class="g-badge g-badge--${PROMO_STATUS_TONE[c.getValue() as keyof typeof PROMO_STATUS_TONE]}">${c.getValue()}</span>` },
]

function openEdit(row: Promotion) {
  edit.value = { ...row }
  noEnd.value = row.endAt === null
  period.value = [new Date(row.startAt), row.endAt ? new Date(row.endAt) : new Date(row.startAt)]
}

function save() {
  if (!edit.value) return
  const i = ALL.value.findIndex((p) => p.id === edit.value!.id)
  if (i >= 0) ALL.value[i] = { ...edit.value, endAt: noEnd.value ? null : edit.value.endAt }
  notify(`${edit.value.id} 저장했습니다`, 'success')
  edit.value = null
}

function stop() {
  if (!edit.value) return
  edit.value.status = '중단'
  confirmStop.value = false
  save()
}

function search() {
  applied.value = { keyword: keyword.value, status: status.value ?? '' }
}
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">프로모션 등록·관리</h1>
        <p class="pg__sub">예약 → 진행 → 종료 · 상태에 따라 수정 가능 항목이 달라진다</p>
      </div>
      <div class="pg__actions">
        <Button label="프로모션 등록" size="small" @click="openEdit(makePromotions(1, Date.now())[0])" />
      </div>
    </header>

    <form class="sfb" @submit.prevent="search">
      <div class="sfb__fields">
        <div class="field" style="min-width: 240px">
          <label class="field__label" for="p-kw">검색어</label>
          <InputText id="p-kw" v-model="keyword" placeholder="프로모션명 또는 ID" fluid />
        </div>
        <div class="field">
          <label class="field__label" for="p-st">상태</label>
          <Select id="p-st" v-model="status" :options="[...PROMO_STATUS]" placeholder="전체" show-clear fluid />
        </div>
      </div>
      <div class="sfb__actions">
        <Button label="조회" type="submit" size="small" />
      </div>
    </form>

    <div class="toolbar"><span>총 <b>{{ rows.length }}</b>건</span><span style="color: var(--ez-text-muted)">행을 클릭하면 편집 패널이 열린다</span></div>

    <TabGrid :columns="columns" :rows="rows" height="440px" @row-click="openEdit" />

    <Drawer
      :visible="!!edit" position="right" :style="{ width: '540px' }"
      :header="edit ? `${edit.id} 편집` : ''"
      @update:visible="(v: boolean) => { if (!v) edit = null }"
    >
      <div v-if="edit" class="ed">
        <div class="ed__state">
          <EzBadge :tone="(PROMO_STATUS_TONE[edit.status] as any)">{{ edit.status }}</EzBadge>
          <!-- 왜 잠겼는지를 화면이 말해 준다. 비활성만 시키면 사용자는 고장으로 읽는다 -->
          <span class="ed__note">{{ lock.note }}</span>
        </div>

        <div class="field">
          <label class="field__label" for="e-name">프로모션명<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
          <InputText id="e-name" v-model="edit.name" fluid :readonly="!lock.name" />
        </div>

        <div class="field">
          <label class="field__label" for="e-kind">유형</label>
          <Select id="e-kind" v-model="edit.kind" :options="[...PROMO_KINDS]" fluid :disabled="!lock.name" />
        </div>

        <div class="field">
          <label class="field__label" for="e-period">기간<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
          <DatePicker
            id="e-period" v-model="period" selection-mode="range" date-format="yy-mm-dd"
            show-icon fluid :disabled="!lock.period || noEnd" placeholder="시작일 ~ 종료일"
          />
          <label class="ed__check">
            <Checkbox v-model="noEnd" binary input-id="e-noend" :disabled="!lock.period" />
            <span>종료일 없음</span>
          </label>
          <p class="field__help">시작일보다 이른 종료일은 선택되지 않는다.</p>
        </div>

        <div class="field">
          <label class="field__label" for="e-target">대상 조건</label>
          <Select id="e-target" v-model="edit.target" :options="[...PROMO_TARGETS]" fluid :disabled="!lock.target" />
        </div>

        <div class="field">
          <label class="field__label" for="e-budget">예산 (원)</label>
          <InputNumber id="e-budget" v-model="edit.budget" fluid :disabled="!lock.budget" :min="0" :step="1000000" show-buttons />
          <p class="field__help">집행 {{ won(edit.used) }}원 · {{ Math.round((edit.used / edit.budget) * 100) }}%</p>
        </div>

        <section class="prev">
          <h3 class="prev__title">고객 화면 미리보기</h3>
          <div class="prev__box">
            <p class="prev__kind">{{ edit.kind }}</p>
            <p class="prev__name">{{ edit.name }}</p>
            <p class="prev__period">{{ edit.startAt }} ~ {{ noEnd ? '상시' : edit.endAt }}</p>
          </div>
        </section>
      </div>

      <template #footer>
        <Button v-if="edit?.status === '진행'" label="중단" severity="danger" outlined size="small" @click="confirmStop = true" />
        <Button label="취소" severity="secondary" outlined size="small" @click="edit = null" />
        <Button label="저장" size="small" :disabled="edit?.status === '종료' || edit?.status === '중단'" @click="save" />
      </template>
    </Drawer>

    <Dialog v-model:visible="confirmStop" modal header="프로모션 중단" :style="{ width: '420px' }">
      <p>{{ edit?.name }} 을(를) 중단합니다.</p>
      <p style="color: var(--ez-text-muted); font-size: var(--ez-font-size-xs)">중단하면 되돌릴 수 없고, 남은 예산은 집행되지 않습니다.</p>
      <template #footer>
        <Button label="취소" severity="secondary" outlined size="small" @click="confirmStop = false" />
        <Button label="중단" severity="danger" size="small" @click="stop" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.ed { display: flex; flex-direction: column; gap: var(--ez-space-4); }
.ed__state { display: flex; align-items: center; gap: var(--ez-space-2); padding: var(--ez-space-3); background: var(--ez-surface-sunken); border-radius: var(--ez-radius-md); }
.ed__note { font-size: var(--ez-font-size-xs); color: var(--ez-text-muted); }
.ed__check { display: inline-flex; align-items: center; gap: var(--ez-space-2); margin-top: var(--ez-space-1); font-size: var(--ez-font-size-xs); cursor: pointer; }

.prev { margin-top: var(--ez-space-2); }
.prev__title { margin: 0 0 var(--ez-space-2); font-size: var(--ez-font-size-xs); color: var(--ez-text-muted); font-weight: var(--ez-font-weight-medium); }
.prev__box { padding: var(--ez-space-4); border: 1px dashed var(--ez-border-strong); border-radius: var(--ez-radius-lg); background: var(--ez-surface-sunken); }
.prev__kind { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-brand); font-weight: var(--ez-font-weight-bold); }
.prev__name { margin: var(--ez-space-1) 0 0; font-size: var(--ez-font-size-lg); font-weight: var(--ez-font-weight-bold); color: var(--ez-text-strong); }
.prev__period { margin: var(--ez-space-1) 0 0; font-size: var(--ez-font-size-xs); color: var(--ez-text-muted); }
</style>
