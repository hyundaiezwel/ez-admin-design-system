<script setup lang="ts">
/**
 * 스파이크 화면 — 문의 답변 관리 (Nuxt UI 판).
 *
 * PrimeVue 판과 **구조·문구·데이터가 같다.** 다른 것은 컴포넌트 출처뿐이라
 * 대비·밀도 측정에 라이브러리 말고 다른 변수가 끼지 않는다.
 *
 * 그리드는 PoC 화면을 옮기지 않고 `TabGrid`로 화면에 녹였다 — 조회 결과가 표로
 * 나와야 하는 자리에 컬럼 원장과 데이터만 넘긴다.
 */
import { computed, ref } from 'vue'
import TabGrid from '../../../shared/grid/TabGrid.vue'
import { INQUIRY_COLUMNS, INQUIRY_PASTE_RULES } from '../../../shared/grid/inquiryColumns'
import { makeInquiries, CHANNELS, STATUSES, ASSIGNEES, type Inquiry } from '../../../fixtures/inquiries'

const ALL = makeInquiries(2000)

const keyword = ref('')
const channel = ref<string | undefined>()
const status = ref<string | undefined>()
const assignee = ref('')
const assigneeQuery = ref('')

const applied = ref({ keyword: '', channel: '', status: '', assignee: '' })
const selectedCount = ref(0)
const pasteMsg = ref('')
const detailOpen = ref(false)
const bulkOpen = ref(false)
const reply = ref('')

const rows = computed<Inquiry[]>(() => {
  const f = applied.value
  return ALL.filter(
    (r) =>
      (!f.keyword || r.title.includes(f.keyword) || r.id.includes(f.keyword)) &&
      (!f.channel || r.channel === f.channel) &&
      (!f.status || r.status === f.status) &&
      (!f.assignee || r.assignee === f.assignee),
  )
})

/** 담당자 자동완성 후보 — 한글 IME 조합 중에도 좁혀지는지가 측정 항목이다 */
const assigneeItems = computed(() =>
  ASSIGNEES.filter((n) => !assigneeQuery.value || n.includes(assigneeQuery.value)),
)

const grid = ref<InstanceType<typeof TabGrid> | null>(null)

function search() {
  applied.value = {
    keyword: keyword.value,
    channel: channel.value ?? '',
    status: status.value ?? '',
    assignee: assignee.value,
  }
}

function reset() {
  keyword.value = ''
  channel.value = undefined
  status.value = undefined
  assignee.value = ''
  assigneeQuery.value = ''
  applied.value = { keyword: '', channel: '', status: '', assignee: '' }
}
</script>

<template>
  <UApp>
    <div class="page">
      <header class="page__head">
        <div>
          <h1 data-m="title" class="page__title">문의 답변 관리</h1>
          <p data-m="muted" class="page__sub">채널별 문의 접수 · 담당자 배정 · 답변 등록</p>
        </div>
        <div class="page__actions">
          <UButton data-m="btn-secondary" color="neutral" variant="outline" @click="grid?.exportCsv('inquiries')">
            엑셀 내려받기
          </UButton>
          <UButton data-m="btn-primary" color="primary" @click="detailOpen = true">답변 등록</UButton>
        </div>
      </header>

      <!-- 조회 영역 -->
      <form class="sfb" @submit.prevent="search">
        <div class="sfb__fields">
          <UFormField label="검색어" data-m="label">
            <UInput v-model="keyword" data-m="input" placeholder="문의번호 또는 제목" />
          </UFormField>
          <UFormField label="채널">
            <USelect v-model="channel" data-m="select" :items="[...CHANNELS]" placeholder="전체" />
          </UFormField>
          <UFormField label="상태">
            <USelect v-model="status" :items="[...STATUSES]" placeholder="전체" />
          </UFormField>
          <UFormField label="담당자">
            <!-- IME 측정 지점: 한글 조합 중 후보가 좁혀지는가 -->
            <UInputMenu
              v-model="assignee"
              v-model:search-term="assigneeQuery"
              data-m="autocomplete"
              :items="assigneeItems"
              placeholder="이름 1자 이상"
            />
          </UFormField>
        </div>
        <div class="sfb__actions">
          <UButton color="neutral" variant="outline" type="button" @click="reset">초기화</UButton>
          <UButton color="primary" type="submit">조회</UButton>
        </div>
      </form>

      <!-- 툴바 -->
      <div class="toolbar">
        <span data-m="body">총 <b>{{ rows.length.toLocaleString('ko-KR') }}</b>건</span>
        <span data-m="muted">선택 {{ selectedCount }}건</span>
        <div class="toolbar__right">
          <UButton size="sm" color="neutral" variant="outline" :disabled="!selectedCount" @click="bulkOpen = true">
            담당자 일괄 변경
          </UButton>
          <UButton data-m="btn-danger" size="sm" color="error">선택 종결</UButton>
        </div>
      </div>

      <p v-if="pasteMsg" data-m="muted" class="paste">{{ pasteMsg }}</p>

      <!-- 그리드 — 화면의 한 영역일 뿐이다 -->
      <TabGrid
        ref="grid"
        :columns="INQUIRY_COLUMNS"
        :rows="rows"
        :paste-rules="INQUIRY_PASTE_RULES"
        editable
        height="380px"
        @selection-change="selectedCount = $event"
        @paste-report="pasteMsg = $event.summary"
      />

      <!-- 상태 뱃지 — 대비 측정 지점 -->
      <div class="badges">
        <UBadge data-m="badge-info" color="info" variant="subtle">처리중</UBadge>
        <UBadge data-m="badge-success" color="success" variant="subtle">답변완료</UBadge>
        <UBadge data-m="badge-warning" color="warning" variant="subtle">보류</UBadge>
        <UBadge data-m="badge-danger" color="error" variant="subtle">SLA 초과</UBadge>
      </div>

      <UModal v-model:open="detailOpen" title="답변 등록">
        <template #body>
          <UFormField label="답변 내용">
            <UTextarea v-model="reply" :rows="5" placeholder="고객에게 보낼 답변을 입력하세요" />
          </UFormField>
        </template>
        <template #footer>
          <UButton color="neutral" variant="outline" @click="detailOpen = false">취소</UButton>
          <UButton color="primary" @click="detailOpen = false">등록</UButton>
        </template>
      </UModal>

      <UModal v-model:open="bulkOpen" title="담당자 일괄 변경">
        <template #body>
          <p data-m="body">선택한 {{ selectedCount }}건의 담당자를 변경합니다.</p>
        </template>
        <template #footer>
          <UButton color="neutral" variant="outline" @click="bulkOpen = false">취소</UButton>
          <UButton color="primary" @click="bulkOpen = false">변경</UButton>
        </template>
      </UModal>
    </div>
  </UApp>
</template>

<style scoped>
.page {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--ez-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--ez-space-4);
}

.page__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ez-space-4);
}

.page__title {
  margin: 0;
  font-size: var(--ez-font-size-xl);
  font-weight: var(--ez-font-weight-bold);
  color: var(--ez-text-strong);
}

.page__sub {
  margin: var(--ez-space-1) 0 0;
  font-size: var(--ez-font-size-xs);
  color: var(--ez-text-muted);
}

.page__actions {
  display: flex;
  gap: var(--ez-space-2);
}

.sfb {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ez-space-4);
  padding: var(--ez-space-3) var(--ez-space-4);
  background: var(--ez-surface-default);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-lg);
}

.sfb__fields {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ez-space-3);
  flex: 1;
}

.sfb__fields > * {
  min-width: 170px;
}

.sfb__actions {
  display: flex;
  gap: var(--ez-space-2);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: var(--ez-space-4);
  font-size: var(--ez-font-size-xs);
  color: var(--ez-text-default);
}

.toolbar__right {
  margin-left: auto;
  display: flex;
  gap: var(--ez-space-2);
}

.paste {
  margin: 0;
  font-size: var(--ez-font-size-2xs);
  color: var(--ez-text-muted);
}

.badges {
  display: flex;
  gap: var(--ez-space-2);
}
</style>
