<script setup lang="ts">
/**
 * 상단 고정 헤더(GNB).
 *
 * 테마·글자 크기 전환을 여기 둔 이유 — 디자인 시스템이 제공하는 기능인데 화면 어딘가
 * 깊숙이 숨기면 아무도 안 쓴다. 실제 제품에서는 내 정보 메뉴로 들어간다.
 */
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggleLnb: [] }>()

const theme = ref<'light' | 'dark'>('light')
const contrast = ref(false)
const scale = ref(1)

function apply() {
  const root = document.documentElement
  root.dataset.theme = theme.value
  if (contrast.value) root.dataset.contrast = 'high'
  else delete root.dataset.contrast
  root.dataset.fontScale = String(scale.value)
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  apply()
}
function toggleContrast() {
  contrast.value = !contrast.value
  apply()
}
function bumpScale() {
  scale.value = scale.value >= 5 ? 1 : scale.value + 1
  apply()
}
</script>

<template>
  <header class="hd">
    <button class="hd__icon" type="button" :aria-label="collapsed ? '메뉴 펼치기' : '메뉴 접기'" @click="emit('toggleLnb')">
      <AppIcon name="menu" />
    </button>

    <RouterLink to="/" class="hd__brand">
      <span class="hd__mark">EZ</span>
      <span class="hd__title">Admin</span>
    </RouterLink>

    <div class="hd__search">
      <AppIcon name="search" :size="15" class="hd__search-icon" />
      <input class="hd__search-input" type="search" placeholder="메뉴·주문·회원 통합 검색" aria-label="통합 검색" />
    </div>

    <div class="hd__actions">
      <button class="hd__icon" type="button" :aria-label="`색상 모드 전환 (현재 ${theme === 'light' ? '라이트' : '다크'})`" @click="toggleTheme">
        <AppIcon :name="theme === 'light' ? 'moon' : 'sun'" />
      </button>
      <button
        class="hd__icon"
        :class="{ 'hd__icon--on': contrast }"
        type="button"
        :aria-pressed="contrast"
        aria-label="선명한 화면 모드"
        @click="toggleContrast"
      >
        <span class="hd__badge-text">AA</span>
      </button>
      <button class="hd__icon" type="button" :aria-label="`글자 크기 ${scale}단계, 누르면 다음 단계`" @click="bumpScale">
        <span class="hd__badge-text">가{{ scale }}</span>
      </button>

      <button class="hd__icon hd__icon--dot" type="button" aria-label="알림 3건">
        <AppIcon name="bell" />
      </button>
      <span class="hd__avatar" aria-hidden="true">김</span>
    </div>
  </header>
</template>

<style scoped>
.hd {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--ez-space-3);
  height: var(--ez-layout-header-height);
  padding: 0 var(--ez-space-4);
  background: var(--ez-surface-default);
  border-bottom: 1px solid var(--ez-border-default);
}

.hd__brand { display: flex; align-items: center; gap: var(--ez-space-2); text-decoration: none; }
.hd__mark {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: var(--ez-radius-sm);
  background: var(--ez-brand);
  color: #fff;
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-bold);
  letter-spacing: .02em;
}
.hd__title { font-size: var(--ez-font-size-md); font-weight: var(--ez-font-weight-bold); color: var(--ez-text-strong); }

.hd__search { position: relative; flex: 1; max-width: 420px; margin-left: var(--ez-space-2); }
.hd__search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--ez-icon-muted); }
.hd__search-input {
  width: 100%;
  height: var(--ez-size-sm);
  padding: 0 var(--ez-space-3) 0 32px;
  background: var(--ez-surface-sunken);
  color: var(--ez-text-default);
  border: 1px solid var(--ez-field-border);
  border-radius: var(--ez-radius-full);
  font: inherit;
  font-size: var(--ez-font-size-xs);
}
.hd__search-input::placeholder { color: var(--ez-field-placeholder); }

.hd__actions { margin-left: auto; display: flex; align-items: center; gap: var(--ez-space-1); }

.hd__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--ez-size-sm);
  height: var(--ez-size-sm);
  border: none;
  border-radius: var(--ez-radius-sm);
  background: none;
  color: var(--ez-icon-default);
  cursor: pointer;
}
.hd__icon:hover { background: var(--ez-surface-hover); }
.hd__icon--on { background: var(--ez-surface-selected); color: var(--ez-text-brand); }
.hd__badge-text { font-size: var(--ez-font-size-2xs); font-weight: var(--ez-font-weight-bold); }

/* 알림 점 — 색만으로 알리지 않도록 aria-label에 건수를 넣었다 */
.hd__icon--dot::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: var(--ez-radius-full);
  background: var(--ez-action-danger);
}

.hd__avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: var(--ez-space-1);
  border-radius: var(--ez-radius-full);
  background: var(--ez-color-gray-80);
  color: var(--ez-text-inverse);
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-bold);
}
</style>
