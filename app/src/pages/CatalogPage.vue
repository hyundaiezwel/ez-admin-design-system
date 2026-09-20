<script setup lang="ts">
/**
 * 컴포넌트 카탈로그 — 토큰이 PrimeVue를 실제로 몰고 있는지 한 화면에서 본다.
 *
 * 헤더의 테마·고대비·글자 크기 스위치를 돌리면 여기 전부가 따라와야 한다.
 * 안 따라오는 것이 있으면 그 컴포넌트는 토큰 밖으로 샌 것이다.
 */
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import { EzBadge, EzEmptyState, notify } from '@ezwel/ui'

const text = ref('입력값')
const sel = ref('두 번째')
const check = ref(true)
const radio = ref('A')
const tog = ref(true)
const dlg = ref(false)
const drw = ref(false)

const FAMILIES = ['gray', 'primary', 'secondary', 'success', 'warning', 'danger']
const STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">컴포넌트 카탈로그</h1>
        <p class="pg__sub">헤더의 테마 · AA · 가N 버튼을 눌러 보면 전부 따라온다</p>
      </div>
    </header>

    <section class="card">
      <h2 class="card__title">색 스케일 — step 번호가 캔버스 대비비다</h2>
      <div v-for="fam in FAMILIES" :key="fam" class="ramp">
        <span class="ramp__name">{{ fam }}</span>
        <div class="ramp__row">
          <div v-for="s in STEPS" :key="s" class="sw">
            <div class="sw__chip" :style="{ background: `var(--ez-color-${fam}-${s})` }" />
            <span class="sw__n">{{ s }}</span>
          </div>
        </div>
      </div>
      <p class="note">40 = 3:1 · 50 = 4.5:1 · 70 = 7:1 · 90 = 15:1 (v1.1.0부터 기준면은 캔버스)</p>
    </section>

    <div class="grid2">
      <section class="card">
        <h2 class="card__title">버튼</h2>
        <div class="row">
          <Button label="주 동작" size="small" />
          <Button label="보조" severity="secondary" outlined size="small" />
          <Button label="텍스트" text size="small" />
          <Button label="위험" severity="danger" size="small" />
          <Button label="비활성" size="small" disabled />
          <Button label="처리 중" size="small" loading />
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">상태 표시</h2>
        <div class="row">
          <Tag value="info" severity="info" />
          <Tag value="success" severity="success" />
          <Tag value="warn" severity="warn" />
          <Tag value="danger" severity="danger" />
        </div>
        <div class="row" style="margin-top: var(--ez-space-3)">
          <EzBadge>대기</EzBadge>
          <EzBadge tone="brand">확정</EzBadge>
          <EzBadge tone="info" dot>진행</EzBadge>
          <EzBadge tone="success">완료</EzBadge>
          <EzBadge tone="warning">보류</EzBadge>
          <EzBadge tone="danger">지연</EzBadge>
        </div>
        <ProgressBar :value="62" style="margin-top: var(--ez-space-4); height: 8px" />
      </section>

      <section class="card">
        <h2 class="card__title">입력</h2>
        <div class="stack">
          <div class="field">
            <label class="field__label" for="c-t">텍스트</label>
            <InputText id="c-t" v-model="text" fluid />
          </div>
          <div class="field">
            <label class="field__label" for="c-t2">오류 상태</label>
            <InputText id="c-t2" model-value="PMS-0" fluid invalid aria-describedby="c-t2-e" />
            <p id="c-t2-e" class="field__err" role="alert">이미 등록된 번호입니다</p>
          </div>
          <div class="field">
            <label class="field__label" for="c-t3">읽기 전용</label>
            <InputText id="c-t3" model-value="연계 항목 · 수정 불가" fluid readonly />
          </div>
          <div class="field">
            <label class="field__label" for="c-s">셀렉트</label>
            <Select id="c-s" v-model="sel" :options="['첫 번째', '두 번째', '세 번째']" fluid />
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">선택</h2>
        <div class="stack">
          <label class="inline"><Checkbox v-model="check" binary input-id="c-c" /><span>체크박스</span></label>
          <div class="row">
            <label v-for="v in ['A', 'B']" :key="v" class="inline">
              <RadioButton v-model="radio" :value="v" :input-id="`c-r-${v}`" /><span>라디오 {{ v }}</span>
            </label>
          </div>
          <label class="inline"><ToggleSwitch v-model="tog" input-id="c-g" /><span>토글</span></label>
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">오버레이 · 피드백</h2>
        <div class="row">
          <Button label="모달" severity="secondary" outlined size="small" @click="dlg = true" />
          <Button label="사이드 패널" severity="secondary" outlined size="small" @click="drw = true" />
          <Button label="토스트" severity="secondary" outlined size="small" @click="notify('저장했습니다', 'success')" />
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">빈 상태</h2>
        <EzEmptyState />
      </section>
    </div>

    <Dialog v-model:visible="dlg" modal header="확인" :style="{ width: '420px' }">
      <p>요구사항 3건을 삭제합니다. 되돌릴 수 없습니다.</p>
      <template #footer>
        <Button label="취소" severity="secondary" outlined size="small" @click="dlg = false" />
        <Button label="삭제" severity="danger" size="small" @click="dlg = false" />
      </template>
    </Dialog>

    <Drawer v-model:visible="drw" position="right" header="사이드 패널" :style="{ width: '420px' }">
      <p>목록 맥락을 유지해야 하는 편집은 모달이 아니라 이쪽이다.</p>
    </Drawer>
  </div>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ez-gap-intra); }
.stack { display: flex; flex-direction: column; gap: var(--ez-gap-inter); }
.inline { display: inline-flex; align-items: center; gap: var(--ez-gap-intra); font-size: var(--ez-font-size-sm); cursor: pointer; }

.ramp { display: flex; align-items: center; gap: var(--ez-gap-inter); margin-bottom: var(--ez-gap-intra); }
.ramp__name { width: 9ch; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); font-family: var(--ez-font-family-mono); }
.ramp__row { display: flex; gap: var(--ez-space-0-5); flex: 1; }
.sw { flex: 1; text-align: center; }
.sw__chip { height: var(--ez-size-sm); border-radius: var(--ez-radius-sm); }
.sw__n { font-size: 9px; color: var(--ez-text-muted); font-family: var(--ez-font-family-mono); }
.note { margin: var(--ez-gap-inter) 0 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); max-inline-size: var(--ez-measure); }
</style>
