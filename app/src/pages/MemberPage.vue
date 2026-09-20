<script setup lang="ts">
/**
 * 회원 관리 — 조회 전용 그리드 + 상세 패널.
 *
 * `editable`을 끈 예다. 끄면 범위 선택 모듈이 안 붙고 체크박스 컬럼이 행 헤더 거터로
 * 바뀌는 문제도 같이 사라진다. 편집이 필요 없는 목록은 이쪽이 기본이다.
 */
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Drawer from 'primevue/drawer'
import { EzBadge } from '@ezwel/ui'
import TabGrid from '@shared/grid/TabGrid.vue'
import QueryState from '../app/QueryState.vue'
import { useMockQuery, ERROR_KEYWORD } from '../app/useMockQuery'
import { makeMembers, GRADES, MEMBER_STATUS, GRADE_TONE, MEMBER_STATUS_TONE, type Member } from '@fixtures/members'
import { won } from '@fixtures/rng'

const ALL = makeMembers(1200)
const keyword = ref('')
const grade = ref<string | null>(null)
const status = ref<string | null>(null)
const applied = ref({ keyword: '', grade: '', status: '' })
const detail = ref<Member | null>(null)

const { rows, loading, error, reload } = useMockQuery(
  () =>
    ALL.filter((m) => {
      const f = applied.value
      return (
        (!f.keyword || m.name.includes(f.keyword) || m.id.includes(f.keyword) || m.email.includes(f.keyword)) &&
        (!f.grade || m.grade === f.grade) &&
        (!f.status || m.status === f.status)
      )
    }),
  { failIf: () => applied.value.keyword.includes(ERROR_KEYWORD) },
)

onMounted(reload)

const badge = (tone: string, v: string) => `<span class="g-badge g-badge--${tone}">${v}</span>`

const columns = [
  { title: '회원번호', field: 'id', width: 110, sorter: 'string', headerFilter: 'input' },
  { title: '이름', field: 'name', width: 96, sorter: 'string', headerFilter: 'input' },
  { title: '이메일', field: 'email', minWidth: 200, sorter: 'string' },
  { title: '등급', field: 'grade', width: 88, hozAlign: 'center', headerHozAlign: 'center', sorter: 'string',
    formatter: (c: any) => badge(GRADE_TONE[c.getValue() as keyof typeof GRADE_TONE], c.getValue()) },
  { title: '상태', field: 'status', width: 88, hozAlign: 'center', headerHozAlign: 'center', sorter: 'string',
    formatter: (c: any) => badge(MEMBER_STATUS_TONE[c.getValue() as keyof typeof MEMBER_STATUS_TONE], c.getValue()) },
  { title: '보유 포인트', field: 'point', width: 118, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number',
    formatter: (c: any) => won(c.getValue()) },
  { title: '주문', field: 'orderCount', width: 72, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number' },
  { title: '가입일', field: 'joinedAt', width: 106, sorter: 'string' },
  { title: '최근 로그인', field: 'lastLoginAt', width: 112, sorter: 'string' },
]

function search() {
  applied.value = { keyword: keyword.value, grade: grade.value ?? '', status: status.value ?? '' }
  reload()
}
function reset() {
  keyword.value = ''
  grade.value = null
  status.value = null
  applied.value = { keyword: '', grade: '', status: '' }
  reload()
}
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">회원 관리</h1>
        <p class="pg__sub">조회 전용 목록 — 행을 클릭하면 상세 패널이 열린다</p>
      </div>
    </header>

    <form class="sfb" @submit.prevent="search">
      <div class="sfb__fields">
        <div class="field" style="min-width: 220px">
          <label class="field__label" for="m-kw">검색어</label>
          <InputText id="m-kw" v-model="keyword" placeholder="이름 · 회원번호 · 이메일" fluid />
        </div>
        <div class="field">
          <label class="field__label" for="m-gr">등급</label>
          <Select id="m-gr" v-model="grade" :options="[...GRADES]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="m-st">상태</label>
          <Select id="m-st" v-model="status" :options="[...MEMBER_STATUS]" placeholder="전체" show-clear fluid />
        </div>
      </div>
      <div class="sfb__actions">
        <Button label="초기화" severity="secondary" outlined type="button" size="small" @click="reset" />
        <Button label="조회" type="submit" size="small" />
      </div>
    </form>

    <div class="toolbar"><span>총 <b>{{ rows.length.toLocaleString('ko-KR') }}</b>명</span></div>

    <QueryState :loading="loading" :error="error" :empty="rows.length === 0" :lines="9" @retry="reload">
      <TabGrid :columns="columns" :rows="rows" height="480px" @row-click="detail = $event" />
    </QueryState>

    <!-- Drawer는 boolean만 받는다. 선택 객체를 그대로 물리면 타입이 어긋난다 -->
    <Drawer
      :visible="!!detail" position="right" :style="{ width: '440px' }"
      :header="detail ? `${detail.name} (${detail.id})` : ''"
      @update:visible="(v: boolean) => { if (!v) detail = null }"
    >
      <dl v-if="detail" class="dt">
        <div><dt>이메일</dt><dd>{{ detail.email }}</dd></div>
        <div><dt>등급</dt><dd><EzBadge :tone="(GRADE_TONE[detail.grade] as any)">{{ detail.grade }}</EzBadge></dd></div>
        <div><dt>상태</dt><dd><EzBadge :tone="(MEMBER_STATUS_TONE[detail.status] as any)">{{ detail.status }}</EzBadge></dd></div>
        <div><dt>보유 포인트</dt><dd class="num">{{ won(detail.point) }} P</dd></div>
        <div><dt>누적 주문</dt><dd class="num">{{ detail.orderCount }} 건</dd></div>
        <div><dt>가입일</dt><dd>{{ detail.joinedAt }}</dd></div>
        <div><dt>최근 로그인</dt><dd>{{ detail.lastLoginAt }}</dd></div>
      </dl>
    </Drawer>
  </div>
</template>

<style scoped>
.dt { display: flex; flex-direction: column; gap: var(--ez-space-3); margin: 0; }
.dt > div { display: grid; grid-template-columns: minmax(96px, max-content) 1fr; gap: var(--ez-gap-inter); align-items: center; font-size: var(--ez-font-size-sm); }
.dt dt { color: var(--ez-text-muted); font-size: var(--ez-font-size-xs); }
.dt dd { margin: 0; }
.num { font-variant-numeric: tabular-nums; }
</style>
