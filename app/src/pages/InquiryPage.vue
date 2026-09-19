<script setup lang="ts">
/**
 * 문의 답변 관리 — 편집 그리드 + 범위 복붙 + 답변 패널.
 *
 * 스파이크에서 쓰던 화면을 셸 위로 옮긴 것이다. 그리드는 PoC를 통째로 옮기지 않고
 * `TabGrid`에 컬럼 원장과 데이터만 넘긴다.
 */
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import Drawer from 'primevue/drawer'
import Dialog from 'primevue/dialog'
import { EzBadge, notify } from '@ezwel/ui'
import TabGrid from '@shared/grid/TabGrid.vue'
import { INQUIRY_COLUMNS, INQUIRY_PASTE_RULES } from '@shared/grid/inquiryColumns'
import { makeInquiries, CHANNELS, STATUSES, ASSIGNEES, STATUS_TONE, type Inquiry } from '@fixtures/inquiries'

const ALL = makeInquiries(2000)

const keyword = ref('')
const channel = ref<string | null>(null)
const status = ref<string | null>(null)
const assignee = ref('')
const assigneeItems = ref<string[]>([])
const applied = ref({ keyword: '', channel: '', status: '', assignee: '' })

const selectedCount = ref(0)
const pasteMsg = ref('')
const replyOpen = ref(false)
const bulkOpen = ref(false)
const reply = ref('')
const current = ref<Inquiry | null>(null)

const rows = computed(() =>
  ALL.filter((r) => {
    const f = applied.value
    return (
      (!f.keyword || r.title.includes(f.keyword) || r.id.includes(f.keyword)) &&
      (!f.channel || r.channel === f.channel) &&
      (!f.status || r.status === f.status) &&
      (!f.assignee || r.assignee === f.assignee)
    )
  }),
)

function searchAssignee(e: { query: string }) {
  assigneeItems.value = ASSIGNEES.filter((n) => !e.query || n.includes(e.query))
}

const grid = ref<InstanceType<typeof TabGrid> | null>(null)

function search() {
  applied.value = { keyword: keyword.value, channel: channel.value ?? '', status: status.value ?? '', assignee: assignee.value }
}
function reset() {
  keyword.value = ''
  channel.value = null
  status.value = null
  assignee.value = ''
  applied.value = { keyword: '', channel: '', status: '', assignee: '' }
}
function openReply(row: Inquiry) {
  current.value = row
  reply.value = ''
  replyOpen.value = true
}
function saveReply() {
  replyOpen.value = false
  notify(`${current.value?.id} 답변을 등록했습니다`, 'success')
}
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">문의 답변 관리</h1>
        <p class="pg__sub">채널별 문의 접수 · 담당자 배정 · 답변 등록</p>
      </div>
      <div class="pg__actions">
        <Button label="엑셀 내려받기" severity="secondary" outlined size="small" @click="grid?.exportCsv('inquiries')" />
        <Button label="답변 등록" size="small" :disabled="!current" @click="replyOpen = true" />
      </div>
    </header>

    <form class="sfb" @submit.prevent="search">
      <div class="sfb__fields">
        <div class="field">
          <label class="field__label" for="q-kw">검색어</label>
          <InputText id="q-kw" v-model="keyword" placeholder="문의번호 또는 제목" fluid />
        </div>
        <div class="field">
          <label class="field__label" for="q-ch">채널</label>
          <Select id="q-ch" v-model="channel" :options="[...CHANNELS]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="q-st">상태</label>
          <Select id="q-st" v-model="status" :options="[...STATUSES]" placeholder="전체" show-clear fluid />
        </div>
        <div class="field">
          <label class="field__label" for="q-as">담당자</label>
          <AutoComplete id="q-as" v-model="assignee" :suggestions="assigneeItems" placeholder="이름 1자 이상" fluid @complete="searchAssignee" />
        </div>
      </div>
      <div class="sfb__actions">
        <Button label="초기화" severity="secondary" outlined type="button" size="small" @click="reset" />
        <Button label="조회" type="submit" size="small" />
      </div>
    </form>

    <div class="toolbar">
      <span>총 <b>{{ rows.length.toLocaleString('ko-KR') }}</b>건</span>
      <span style="color: var(--ez-text-muted)">선택 {{ selectedCount }}건</span>
      <div class="toolbar__right">
        <Button label="담당자 일괄 변경" size="small" severity="secondary" outlined :disabled="!selectedCount" @click="bulkOpen = true" />
        <Button label="선택 종결" size="small" severity="danger" :disabled="!selectedCount" />
      </div>
    </div>

    <p v-if="pasteMsg" class="paste">{{ pasteMsg }}</p>

    <TabGrid
      ref="grid"
      :columns="INQUIRY_COLUMNS"
      :rows="rows"
      :paste-rules="INQUIRY_PASTE_RULES"
      editable
      height="460px"
      @selection-change="selectedCount = $event"
      @paste-report="pasteMsg = $event.summary"
    />

    <p class="hint">
      셀을 드래그해 범위를 잡고 <kbd>⌘C</kbd>/<kbd>⌘V</kbd>로 복사·붙여넣기 할 수 있다.
      규칙에 맞지 않는 값은 <b>전량 거부</b>된다 — 일부만 들어가면 어디까지 반영됐는지 알 수 없다.
    </p>

    <!-- 답변 패널 — 목록 맥락을 유지해야 해서 모달이 아니라 사이드 패널이다 -->
    <Drawer v-model:visible="replyOpen" position="right" :style="{ width: '520px' }" :header="current ? `${current.id} 답변 등록` : '답변 등록'">
      <div v-if="current" class="rp">
        <dl class="rp__meta">
          <div><dt>채널</dt><dd>{{ current.channel }}</dd></div>
          <div><dt>분류</dt><dd>{{ current.category }}</dd></div>
          <div><dt>고객</dt><dd>{{ current.customer }}</dd></div>
          <div><dt>상태</dt><dd><EzBadge :tone="(STATUS_TONE[current.status] as any)">{{ current.status }}</EzBadge></dd></div>
        </dl>
        <p class="rp__q">{{ current.title }}</p>
        <div class="field">
          <label class="field__label" for="rp-body">답변 내용<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
          <Textarea id="rp-body" v-model="reply" rows="8" placeholder="고객에게 보낼 답변을 입력하세요" fluid />
          <p class="field__help">{{ reply.length }} / 1500자</p>
        </div>
      </div>
      <template #footer>
        <Button label="취소" severity="secondary" outlined size="small" @click="replyOpen = false" />
        <Button label="등록" size="small" :disabled="!reply.trim()" @click="saveReply" />
      </template>
    </Drawer>

    <Dialog v-model:visible="bulkOpen" modal header="담당자 일괄 변경" :style="{ width: '420px' }">
      <p>선택한 {{ selectedCount }}건의 담당자를 변경합니다.</p>
      <p style="color: var(--ez-text-muted); font-size: var(--ez-font-size-xs)">되돌릴 수 없습니다.</p>
      <template #footer>
        <Button label="취소" severity="secondary" outlined size="small" @click="bulkOpen = false" />
        <Button label="변경" size="small" @click="bulkOpen = false; notify('담당자를 변경했습니다', 'success')" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.paste { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
.hint { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
kbd {
  padding: 1px 5px; border: 1px solid var(--ez-border-default); border-radius: var(--ez-radius-sm);
  background: var(--ez-surface-sunken); font-family: var(--ez-font-family-mono); font-size: 10px;
}
.rp { display: flex; flex-direction: column; gap: var(--ez-space-4); }
.rp__meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--ez-space-2); margin: 0; }
.rp__meta > div { display: flex; gap: var(--ez-space-2); font-size: var(--ez-font-size-xs); }
.rp__meta dt { color: var(--ez-text-muted); min-width: 44px; }
.rp__meta dd { margin: 0; }
.rp__q { margin: 0; padding: var(--ez-space-3); background: var(--ez-surface-sunken); border-radius: var(--ez-radius-md); font-size: var(--ez-font-size-sm); }
</style>
