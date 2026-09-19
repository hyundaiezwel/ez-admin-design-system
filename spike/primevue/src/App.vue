<script setup lang="ts">
/**
 * 스파이크 화면 — 문의 답변 관리 (PrimeVue 판).
 *
 * Nuxt UI 판과 구조·문구·데이터가 같다.
 *
 * 한 가지 구조적 차이는 그대로 드러내 둔다 — PrimeVue v4에는 라벨·도움말·오류를 묶는
 * 폼 필드 래퍼가 없다(`UFormField` 대응물 없음). 그래서 아래 `<label>`은 앱이 소유한다.
 * 도입하면 우리가 만들어야 할 몫이라는 뜻이고, 측정 결과를 읽을 때도 감안해야 한다.
 */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import TabGrid from '../../../shared/grid/TabGrid.vue'
import { INQUIRY_COLUMNS, INQUIRY_PASTE_RULES } from '../../../shared/grid/inquiryColumns'
import { makeInquiries, CHANNELS, STATUSES, ASSIGNEES, type Inquiry } from '../../../fixtures/inquiries'

const ALL = makeInquiries(2000)

const keyword = ref('')
const channel = ref<string | null>(null)
const status = ref<string | null>(null)
const assignee = ref('')
const assigneeItems = ref<string[]>([])

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

/** 담당자 자동완성 — 한글 IME 조합 중에도 좁혀지는지가 측정 항목이다 */
function searchAssignee(e: { query: string }) {
  assigneeItems.value = ASSIGNEES.filter((n) => !e.query || n.includes(e.query))
}

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
  channel.value = null
  status.value = null
  assignee.value = ''
  applied.value = { keyword: '', channel: '', status: '', assignee: '' }
}
</script>

<template>
  <div class="page">
    <header class="page__head">
      <div>
        <h1 data-m="title" class="page__title">문의 답변 관리</h1>
        <p data-m="muted" class="page__sub">채널별 문의 접수 · 담당자 배정 · 답변 등록</p>
      </div>
      <div class="page__actions">
        <Button data-m="btn-secondary" label="엑셀 내려받기" severity="secondary" outlined @click="grid?.exportCsv('inquiries')" />
        <Button data-m="btn-primary" label="답변 등록" @click="detailOpen = true" />
      </div>
    </header>

    <!-- 조회 영역 -->
    <form class="sfb" @submit.prevent="search">
      <div class="sfb__fields">
        <div class="field">
          <label data-m="label" class="field__label" for="kw">검색어</label>
          <InputText id="kw" v-model="keyword" data-m="input" placeholder="문의번호 또는 제목" fluid />
        </div>
        <div class="field">
          <label class="field__label" for="ch">채널</label>
          <Select id="ch" v-model="channel" data-m="select" :options="[...CHANNELS]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="st">상태</label>
          <Select id="st" v-model="status" :options="[...STATUSES]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="as">담당자</label>
          <!-- IME 측정 지점 -->
          <AutoComplete
            id="as"
            v-model="assignee"
            data-m="autocomplete"
            :suggestions="assigneeItems"
            placeholder="이름 1자 이상"
            fluid
            @complete="searchAssignee"
          />
        </div>
      </div>
      <div class="sfb__actions">
        <Button label="초기화" severity="secondary" outlined type="button" @click="reset" />
        <Button label="조회" type="submit" />
      </div>
    </form>

    <!-- 툴바 -->
    <div class="toolbar">
      <span data-m="body">총 <b>{{ rows.length.toLocaleString('ko-KR') }}</b>건</span>
      <span data-m="muted">선택 {{ selectedCount }}건</span>
      <div class="toolbar__right">
        <Button label="담당자 일괄 변경" size="small" severity="secondary" outlined :disabled="!selectedCount" @click="bulkOpen = true" />
        <Button data-m="btn-danger" label="선택 종결" size="small" severity="danger" />
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
      <Tag data-m="badge-info" severity="info" value="처리중" />
      <Tag data-m="badge-success" severity="success" value="답변완료" />
      <Tag data-m="badge-warning" severity="warn" value="보류" />
      <Tag data-m="badge-danger" severity="danger" value="SLA 초과" />
    </div>

    <Dialog v-model:visible="detailOpen" modal header="답변 등록" :style="{ width: '520px' }">
      <div class="field">
        <label class="field__label" for="rp">답변 내용</label>
        <Textarea id="rp" v-model="reply" rows="5" placeholder="고객에게 보낼 답변을 입력하세요" fluid />
      </div>
      <template #footer>
        <Button label="취소" severity="secondary" outlined @click="detailOpen = false" />
        <Button label="등록" @click="detailOpen = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="bulkOpen" modal header="담당자 일괄 변경" :style="{ width: '420px' }">
      <p data-m="body">선택한 {{ selectedCount }}건의 담당자를 변경합니다.</p>
      <template #footer>
        <Button label="취소" severity="secondary" outlined @click="bulkOpen = false" />
        <Button label="변경" @click="bulkOpen = false" />
      </template>
    </Dialog>
  </div>
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

.field {
  display: flex;
  flex-direction: column;
  gap: var(--ez-space-1);
  min-width: 170px;
}

/* PrimeVue에 폼 필드 래퍼가 없어 라벨은 앱이 소유한다 */
.field__label {
  font-size: var(--ez-font-size-xs);
  font-weight: var(--ez-font-weight-medium);
  color: var(--ez-text-default);
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
