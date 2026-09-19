<script setup lang="ts">
/** 공통코드 — 마스터·디테일 2단 연동. 좌측을 고르면 우측이 따라온다. */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { EzBadge } from '@ezwel/ui'
import TabGrid from '@shared/grid/TabGrid.vue'

interface Group { code: string; name: string; count: number; use: 'Y' | 'N' }
interface Detail { code: string; name: string; tone: string; sort: number; use: 'Y' | 'N' }

const GROUPS: Group[] = [
  { code: 'INQ_STATUS', name: '문의 처리 상태', count: 5, use: 'Y' },
  { code: 'INQ_CHANNEL', name: '문의 채널', count: 5, use: 'Y' },
  { code: 'ORD_STATUS', name: '주문 상태', count: 6, use: 'Y' },
  { code: 'MBR_GRADE', name: '회원 등급', count: 4, use: 'Y' },
  { code: 'PRM_STATUS', name: '프로모션 상태', count: 5, use: 'Y' },
  { code: 'LEGACY_TYPE', name: '(구) 분류 코드', count: 3, use: 'N' },
]

const DETAILS: Record<string, Detail[]> = {
  INQ_STATUS: [
    { code: 'RECEIVED', name: '접수', tone: 'neutral', sort: 1, use: 'Y' },
    { code: 'PROGRESS', name: '처리중', tone: 'info', sort: 2, use: 'Y' },
    { code: 'ANSWERED', name: '답변완료', tone: 'success', sort: 3, use: 'Y' },
    { code: 'HOLD', name: '보류', tone: 'warning', sort: 4, use: 'Y' },
    { code: 'CLOSED', name: '종결', tone: 'neutral', sort: 5, use: 'Y' },
  ],
  MBR_GRADE: [
    { code: 'BASIC', name: '일반', tone: 'neutral', sort: 1, use: 'Y' },
    { code: 'SILVER', name: '실버', tone: 'info', sort: 2, use: 'Y' },
    { code: 'GOLD', name: '골드', tone: 'warning', sort: 3, use: 'Y' },
    { code: 'VIP', name: 'VIP', tone: 'brand', sort: 4, use: 'Y' },
  ],
}

const selected = ref<Group>(GROUPS[0])
const keyword = ref('')

const groups = computed(() => GROUPS.filter((g) => !keyword.value || g.name.includes(keyword.value) || g.code.includes(keyword.value)))
const details = computed(() => DETAILS[selected.value.code] ?? [])

const groupColumns = [
  { title: '그룹코드', field: 'code', width: 130, sorter: 'string' },
  { title: '그룹명', field: 'name', minWidth: 130, sorter: 'string' },
  { title: '건수', field: 'count', width: 62, hozAlign: 'right', headerHozAlign: 'right', sorter: 'number' },
  { title: '사용', field: 'use', width: 58, hozAlign: 'center', headerHozAlign: 'center',
    formatter: (c: any) => (c.getValue() === 'Y' ? '사용' : '<span style="color:var(--ez-text-muted)">미사용</span>') },
]
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">공통코드</h1>
        <p class="pg__sub">상태 라벨과 뱃지 색의 단일 원천 — 화면에 하드코딩하지 않는다</p>
      </div>
      <div class="pg__actions"><Button label="그룹 추가" size="small" /></div>
    </header>

    <div class="cols">
      <section class="card">
        <h2 class="card__title">코드 그룹</h2>
        <div class="field" style="margin-bottom: var(--ez-space-3)">
          <InputText v-model="keyword" placeholder="그룹명 또는 코드" fluid aria-label="코드 그룹 검색" />
        </div>
        <TabGrid
          :columns="groupColumns"
          :rows="groups"
          height="420px"
          @row-click="(r: any) => (selected = r)"
        />
      </section>

      <section class="card">
        <h2 class="card__title">{{ selected.name }} <span class="code">{{ selected.code }}</span></h2>
        <table v-if="details.length" class="dt">
          <caption class="ez-sr-only">{{ selected.name }} 하위 코드</caption>
          <thead>
            <tr><th scope="col">코드</th><th scope="col">이름</th><th scope="col">뱃지</th><th scope="col">정렬</th><th scope="col">사용</th></tr>
          </thead>
          <tbody>
            <tr v-for="d in details" :key="d.code">
              <td class="code">{{ d.code }}</td>
              <td>{{ d.name }}</td>
              <td><EzBadge :tone="(d.tone as any)">{{ d.name }}</EzBadge></td>
              <td class="num">{{ d.sort }}</td>
              <td>{{ d.use }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">이 그룹의 하위 코드는 목업에 없습니다.</p>
        <p class="note">
          뱃지 색(<code>tone</code>)이 코드 속성으로 내려온다. 화면은 <code>EzBadge</code>에 그대로 넘길 뿐이라
          기획이 라벨·색을 바꿔도 프론트 배포가 필요 없다.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cols { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: var(--ez-space-4); }
.code { font-family: var(--ez-font-family-mono); font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
.dt { width: 100%; border-collapse: collapse; font-size: var(--ez-font-size-xs); }
.dt th, .dt td { padding: var(--ez-space-2) var(--ez-space-3); text-align: left; border-bottom: 1px solid var(--ez-border-subtle); }
.dt th { color: var(--ez-text-muted); font-weight: var(--ez-font-weight-medium); }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.empty { padding: var(--ez-space-10); text-align: center; color: var(--ez-text-muted); font-size: var(--ez-font-size-sm); }
.note { margin: var(--ez-space-4) 0 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
</style>
