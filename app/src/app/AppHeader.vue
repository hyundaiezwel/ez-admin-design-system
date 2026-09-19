<script setup lang="ts">
/**
 * 상단 고정 헤더(GNB).
 *
 * `data-scheme`으로 **이 조각만** 다크가 된다 — 본문은 밝은 채로 둔다.
 * 표시 설정은 화면이 아니라 셸의 성질이라 `prefs`가 들고 있다.
 */
import AppIcon from './AppIcon.vue'
import { prefs, chromeScheme } from './prefs'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggleLnb: [] }>()

const bumpScale = () => (prefs.fontScale = prefs.fontScale >= 5 ? 1 : prefs.fontScale + 1)
</script>

<template>
  <header class="hd" :data-scheme="chromeScheme()">
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
      <button
        class="hd__icon"
        :class="{ 'hd__icon--on': prefs.darkChrome }"
        type="button"
        :aria-pressed="prefs.darkChrome"
        aria-label="셸만 어둡게"
        @click="prefs.darkChrome = !prefs.darkChrome"
      >
        <span class="hd__badge-text">셸</span>
      </button>
      <button
        class="hd__icon"
        type="button"
        :aria-label="`색상 모드 전환 (현재 ${prefs.theme === 'light' ? '라이트' : '다크'})`"
        @click="prefs.theme = prefs.theme === 'light' ? 'dark' : 'light'"
      >
        <AppIcon :name="prefs.theme === 'light' ? 'moon' : 'sun'" />
      </button>
      <button
        class="hd__icon"
        :class="{ 'hd__icon--on': prefs.contrast }"
        type="button"
        :aria-pressed="prefs.contrast"
        aria-label="선명한 화면 모드"
        @click="prefs.contrast = !prefs.contrast"
      >
        <span class="hd__badge-text">AA</span>
      </button>
      <button class="hd__icon" type="button" :aria-label="`글자 크기 ${prefs.fontScale}단계, 누르면 다음 단계`" @click="bumpScale">
        <span class="hd__badge-text">가{{ prefs.fontScale }}</span>
      </button>

      <!-- 같은 화면을 WebSquare 구조로 본다. 구조 비교가 목적이라 셸만 갈린다 -->
      <RouterLink class="hd__skin" to="/ws">WebSquare 구조로 보기</RouterLink>

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

.hd__skin {
  margin-right: var(--ez-space-2);
  padding: 0 var(--ez-space-3);
  height: var(--ez-size-sm);
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-full);
  color: var(--ez-text-muted);
  font-size: var(--ez-font-size-2xs);
  text-decoration: none;
  white-space: nowrap;
}
.hd__skin:hover { border-color: var(--ez-border-strong); color: var(--ez-text-default); }

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
