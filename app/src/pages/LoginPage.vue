<script setup lang="ts">
/** 로그인. 셸 밖 화면이라 폼 검증·오류 표시만 확인하는 자리다. */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'

const router = useRouter()
const id = ref('')
const pw = ref('')
const keep = ref(false)
const errors = ref<{ id?: string; pw?: string }>({})
const busy = ref(false)

function submit() {
  errors.value = {}
  if (!id.value) errors.value.id = '아이디를 입력하세요'
  else if (!/^[A-Za-z0-9]+$/.test(id.value)) errors.value.id = '아이디는 영문·숫자만 사용합니다'
  if (!pw.value) errors.value.pw = '비밀번호를 입력하세요'
  else if (pw.value.length < 8) errors.value.pw = '비밀번호는 8자 이상입니다'
  if (Object.keys(errors.value).length) return

  busy.value = true
  setTimeout(() => router.push('/'), 400)
}
</script>

<template>
  <form class="login" @submit.prevent="submit">
    <div class="login__brand">
      <span class="login__mark">EZ</span>
      <div>
        <h1 class="login__title">EZ Admin</h1>
        <p class="login__sub">어드민 목업 — 아무 값이나 넣으면 들어갑니다</p>
      </div>
    </div>

    <div class="field">
      <label class="field__label" for="lg-id">아이디<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
      <InputText
        id="lg-id" v-model="id" fluid autocomplete="username"
        :invalid="!!errors.id" :aria-describedby="errors.id ? 'lg-id-err' : undefined"
      />
      <p v-if="errors.id" id="lg-id-err" class="field__err" role="alert">{{ errors.id }}</p>
    </div>

    <div class="field">
      <label class="field__label" for="lg-pw">비밀번호<span class="field__req" aria-hidden="true">*</span><span class="ez-sr-only">(필수)</span></label>
      <Password
        input-id="lg-pw" v-model="pw" fluid toggle-mask :feedback="false" autocomplete="current-password"
        :invalid="!!errors.pw" :aria-describedby="errors.pw ? 'lg-pw-err' : undefined"
      />
      <p v-if="errors.pw" id="lg-pw-err" class="field__err" role="alert">{{ errors.pw }}</p>
    </div>

    <label class="login__keep">
      <Checkbox v-model="keep" binary input-id="lg-keep" />
      <span>로그인 상태 유지</span>
    </label>

    <Button type="submit" label="로그인" :loading="busy" fluid />

    <p class="login__note">비밀번호를 5회 틀리면 잠깁니다. 담당자에게 문의하세요.</p>
  </form>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: var(--ez-gap-inter);
  /* 폼 한 칸 폭 — 글자가 커지면 같이 넓어진다 */
  width: 34ch;
  max-width: 100%;
  padding: var(--ez-space-8);
  background: var(--ez-surface-default);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-lg);
  box-shadow: var(--ez-shadow-overlay);
}
.login__brand { display: flex; align-items: center; gap: var(--ez-gap-inter); }
.login__mark {
  display: grid; place-items: center; width: var(--ez-size-lg); height: var(--ez-size-lg);
  border-radius: var(--ez-radius-md); background: var(--ez-brand);
  color: var(--ez-text-inverse); font-weight: var(--ez-font-weight-bold);
}
.login__title { margin: 0; font-size: var(--ez-font-size-xl); color: var(--ez-text-strong); }
.login__sub { margin: 2px 0 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
.login__keep { display: flex; align-items: center; gap: var(--ez-gap-intra); font-size: var(--ez-font-size-xs); cursor: pointer; }
.login__note { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); text-align: center; }
</style>
