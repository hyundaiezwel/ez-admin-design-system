<script setup lang="ts">
/** 상품 등록·수정 — 입력 타입 풀세트. 저장 검증과 미저장 이탈 확인이 목적이다. */
import { computed, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import FileUpload from 'primevue/fileupload'
import Dialog from 'primevue/dialog'
import { notify } from '@ezwel/ui'

const form = ref({
  name: '', code: '', category: null as string | null, channels: [] as string[],
  price: 0, stock: 0, taxType: '과세', openAt: null as Date | null,
  active: true, note: '',
})
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const dirty = ref(false)
const leaveAsk = ref(false)
let leaveNext: (() => void) | null = null

const CATEGORIES = ['상품권', '건강', '여행', '문화', '도서']
const CHANNELS = ['웹', '앱', '제휴몰']

const noteBytes = computed(() => new TextEncoder().encode(form.value.note).length)

function touch() { dirty.value = true }

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim()) e.name = '상품명을 입력하세요'
  else if (form.value.name.length > 50) e.name = '상품명은 50자 이하입니다'
  if (!form.value.code.trim()) e.code = '상품코드를 입력하세요'
  else if (!/^[A-Z0-9-]+$/.test(form.value.code)) e.code = '영문 대문자·숫자·하이픈만 사용합니다'
  if (!form.value.category) e.category = '분류를 선택하세요'
  if (form.value.price <= 0) e.price = '판매가는 1원 이상입니다'
  if (noteBytes.value > 1500) e.note = `비고는 1500byte 이하입니다 (현재 ${noteBytes.value})`
  errors.value = e
  return Object.keys(e).length === 0
}

function save() {
  if (!validate()) {
    notify('입력값을 확인하세요', 'warning')
    return
  }
  saving.value = true
  setTimeout(() => {
    saving.value = false
    dirty.value = false
    notify('상품을 저장했습니다', 'success')
  }, 500)
}

onBeforeRouteLeave((_to, _from, next) => {
  if (!dirty.value) return next()
  leaveNext = () => next()
  leaveAsk.value = true
})
</script>

<template>
  <div class="pg">
    <header class="pg__head">
      <div>
        <h1 class="pg__title">상품 등록</h1>
        <p class="pg__sub">필수 항목은 <span class="field__req">*</span> 로 표시된다 · 저장하지 않고 나가면 확인을 묻는다</p>
      </div>
      <div class="pg__actions">
        <Button label="취소" severity="secondary" outlined size="small" />
        <Button label="저장" size="small" :loading="saving" @click="save" />
      </div>
    </header>

    <div class="grid2">
      <section class="card">
        <h2 class="card__title">기본 정보</h2>
        <div class="stack">
          <div class="field">
            <label class="field__label" for="f-name">상품명<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
            <InputText id="f-name" v-model="form.name" fluid maxlength="50" :invalid="!!errors.name"
              :aria-describedby="errors.name ? 'f-name-e' : 'f-name-h'" @input="touch" />
            <p v-if="errors.name" id="f-name-e" class="field__err" role="alert">{{ errors.name }}</p>
            <p v-else id="f-name-h" class="field__help">{{ form.name.length }} / 50자</p>
          </div>

          <div class="field">
            <label class="field__label" for="f-code">상품코드<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
            <InputText id="f-code" v-model="form.code" fluid placeholder="예: GIFT-0001" :invalid="!!errors.code"
              :aria-describedby="errors.code ? 'f-code-e' : undefined" @input="touch" />
            <p v-if="errors.code" id="f-code-e" class="field__err" role="alert">{{ errors.code }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="f-cat">분류<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
            <Select id="f-cat" v-model="form.category" :options="CATEGORIES" placeholder="선택하세요" fluid
              :invalid="!!errors.category" @change="touch" />
            <p v-if="errors.category" class="field__err" role="alert">{{ errors.category }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="f-ch">판매 채널</label>
            <MultiSelect id="f-ch" v-model="form.channels" :options="CHANNELS" placeholder="선택하세요" fluid display="chip" @change="touch" />
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">판매 조건</h2>
        <div class="stack">
          <div class="field">
            <label class="field__label" for="f-price">판매가<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
            <InputNumber id="f-price" v-model="form.price" fluid :min="0" suffix=" 원" :invalid="!!errors.price" @input="touch" />
            <p v-if="errors.price" class="field__err" role="alert">{{ errors.price }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="f-stock">재고</label>
            <InputNumber id="f-stock" v-model="form.stock" fluid :min="0" show-buttons @input="touch" />
          </div>

          <fieldset class="field rad">
            <legend class="field__label">과세 구분</legend>
            <label v-for="t in ['과세', '면세']" :key="t" class="rad__item">
              <RadioButton v-model="form.taxType" :value="t" :input-id="`tax-${t}`" @change="touch" />
              <span>{{ t }}</span>
            </label>
          </fieldset>

          <div class="field">
            <label class="field__label" for="f-open">판매 시작일</label>
            <DatePicker id="f-open" v-model="form.openAt" date-format="yy-mm-dd" show-icon fluid @date-select="touch" />
          </div>

          <label class="tog">
            <ToggleSwitch v-model="form.active" input-id="f-active" @change="touch" />
            <span>판매 사용</span>
          </label>
        </div>
      </section>
    </div>

    <section class="card">
      <h2 class="card__title">첨부 · 비고</h2>
      <div class="stack">
        <div class="field">
          <span class="field__label">상품 이미지</span>
          <FileUpload mode="basic" accept="image/*" :max-file-size="5000000" choose-label="파일 선택" custom-upload @select="touch" />
          <p class="field__help">jpg · png, 5MB 이하. 목업이라 업로드되지 않는다.</p>
        </div>
        <div class="field">
          <label class="field__label" for="f-note">비고</label>
          <Textarea id="f-note" v-model="form.note" rows="4" fluid :invalid="!!errors.note"
            :aria-describedby="errors.note ? 'f-note-e' : 'f-note-h'" @input="touch" />
          <p v-if="errors.note" id="f-note-e" class="field__err" role="alert">{{ errors.note }}</p>
          <p v-else id="f-note-h" class="field__help">{{ noteBytes }} / 1500 byte</p>
        </div>
      </div>
    </section>

    <Dialog v-model:visible="leaveAsk" modal header="저장하지 않고 나갈까요?" :style="{ width: '420px' }">
      <p>변경한 내용이 저장되지 않았습니다.</p>
      <template #footer>
        <Button label="계속 편집" severity="secondary" outlined size="small" @click="leaveAsk = false" />
        <Button label="나가기" severity="danger" size="small" @click="leaveAsk = false; dirty = false; leaveNext?.()" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--ez-space-4); }
.rad { border: none; margin: 0; padding: 0; }
.rad__item { display: inline-flex; align-items: center; gap: var(--ez-space-2); margin-right: var(--ez-space-4); font-size: var(--ez-font-size-sm); cursor: pointer; }
.tog { display: inline-flex; align-items: center; gap: var(--ez-space-2); font-size: var(--ez-font-size-sm); cursor: pointer; }
</style>
