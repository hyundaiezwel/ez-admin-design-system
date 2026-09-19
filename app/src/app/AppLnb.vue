<script setup lang="ts">
/**
 * 좌측 메뉴(LNB).
 *
 * 접으면 1depth 아이콘만 남고, 아이콘에 마우스를 올리면 하위가 플라이아웃으로 뜬다 —
 * 접힌 상태에서 하위 메뉴에 도달할 길이 없으면 접기 기능이 반쪽이 된다.
 *
 * 열림 상태는 화면마다 기억하지 않고 셸이 하나로 들고 있다.
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MENU, type MenuItem } from './menu'
import AppIcon from './AppIcon.vue'
import { chromeScheme } from './prefs'

const props = defineProps<{ collapsed: boolean }>()
const route = useRoute()

/** 펼쳐진 1depth. 현재 경로가 속한 그룹은 자동으로 연다 */
const open = ref<Set<string>>(new Set())
const flyout = ref<string | null>(null)

watch(
  () => route.path,
  (path) => {
    const top = MENU.find((m) => m.children?.some((c) => c.to === path))
    if (top) open.value.add(top.id)
  },
  { immediate: true },
)

const isActive = (item: MenuItem) => item.to === route.path
const groupActive = (item: MenuItem) => item.children?.some((c) => c.to === route.path) ?? false

function toggle(item: MenuItem) {
  if (!item.children) return
  const s = new Set(open.value)
  s.has(item.id) ? s.delete(item.id) : s.add(item.id)
  open.value = s
}

const width = computed(() => (props.collapsed ? 'var(--lnb-w-collapsed)' : 'var(--lnb-w)'))
</script>

<template>
  <nav class="lnb" :style="{ width }" :data-scheme="chromeScheme()" aria-label="주 메뉴">
    <ul class="lnb__list">
      <li v-for="item in MENU" :key="item.id" class="lnb__group" @mouseleave="flyout = null">
        <!-- 잎 노드는 링크, 가지는 버튼. 역할이 다르면 태그도 달라야 키보드 동작이 맞는다 -->
        <RouterLink
          v-if="item.to"
          class="lnb__row"
          :class="{ 'lnb__row--on': isActive(item) }"
          :to="item.to"
          :aria-current="isActive(item) ? 'page' : undefined"
          @mouseenter="flyout = null"
        >
          <AppIcon :name="item.icon!" />
          <span v-if="!collapsed" class="lnb__label">{{ item.label }}</span>
        </RouterLink>

        <button
          v-else
          class="lnb__row"
          :class="{ 'lnb__row--on': groupActive(item) }"
          type="button"
          :aria-expanded="!collapsed && open.has(item.id)"
          @click="toggle(item)"
          @mouseenter="collapsed && (flyout = item.id)"
        >
          <AppIcon :name="item.icon!" />
          <template v-if="!collapsed">
            <span class="lnb__label">{{ item.label }}</span>
            <AppIcon name="chevron" :size="14" class="lnb__chev" :class="{ 'lnb__chev--open': open.has(item.id) }" />
          </template>
        </button>

        <ul v-if="!collapsed && item.children && open.has(item.id)" class="lnb__sub">
          <li v-for="child in item.children" :key="child.id">
            <RouterLink
              class="lnb__subrow"
              :class="{ 'lnb__subrow--on': isActive(child) }"
              :to="child.to!"
              :aria-current="isActive(child) ? 'page' : undefined"
            >
              {{ child.label }}
            </RouterLink>
          </li>
        </ul>

        <!-- 접힘 상태 플라이아웃 -->
        <div v-if="collapsed && item.children && flyout === item.id" class="lnb__flyout">
          <p class="lnb__flyout-head">{{ item.label }}</p>
          <RouterLink
            v-for="child in item.children"
            :key="child.id"
            class="lnb__flyout-item"
            :class="{ 'lnb__subrow--on': isActive(child) }"
            :to="child.to!"
          >
            {{ child.label }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.lnb {
  flex: none;
  background: var(--ez-surface-default);
  border-right: 1px solid var(--ez-border-default);
  overflow: visible;
  transition: width var(--ez-duration-normal) var(--ez-easing-standard);
}

.lnb__list { list-style: none; margin: 0; padding: var(--ez-space-2); display: flex; flex-direction: column; gap: 2px; }
.lnb__group { position: relative; }

.lnb__row {
  display: flex;
  align-items: center;
  gap: var(--ez-space-2);
  width: 100%;
  height: var(--ez-size-md);
  padding: 0 var(--ez-space-2);
  border: none;
  border-radius: var(--ez-radius-md);
  background: none;
  color: var(--ez-text-default);
  font: inherit;
  font-size: var(--ez-font-size-sm);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.lnb__row:hover { background: var(--ez-surface-hover); }

.lnb__row--on {
  background: var(--ez-surface-selected);
  color: var(--ez-text-brand);
  font-weight: var(--ez-font-weight-bold);
}

.lnb__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lnb__chev { transition: transform var(--ez-duration-fast) var(--ez-easing-standard); color: var(--ez-icon-muted); }
.lnb__chev--open { transform: rotate(180deg); }

.lnb__sub { list-style: none; margin: 2px 0 var(--ez-space-1); padding: 0 0 0 var(--ez-space-6); display: flex; flex-direction: column; gap: 1px; }

.lnb__subrow {
  display: block;
  padding: 6px var(--ez-space-2);
  border-radius: var(--ez-radius-sm);
  color: var(--ez-text-muted);
  font-size: var(--ez-font-size-xs);
  text-decoration: none;
}

.lnb__subrow:hover { background: var(--ez-surface-hover); color: var(--ez-text-default); }
.lnb__subrow--on { color: var(--ez-text-brand); font-weight: var(--ez-font-weight-bold); }

.lnb__flyout {
  position: absolute;
  left: 100%;
  top: 0;
  z-index: var(--ez-z-dropdown);
  min-width: 180px;
  margin-left: var(--ez-space-1);
  padding: var(--ez-space-2);
  background: var(--ez-surface-raised);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-md);
  box-shadow: var(--ez-shadow-overlay);
}

.lnb__flyout-head {
  margin: 0 0 var(--ez-space-1);
  padding: 0 var(--ez-space-2);
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-bold);
  color: var(--ez-text-muted);
}

.lnb__flyout-item {
  display: block;
  padding: 6px var(--ez-space-2);
  border-radius: var(--ez-radius-sm);
  color: var(--ez-text-default);
  font-size: var(--ez-font-size-xs);
  text-decoration: none;
}

.lnb__flyout-item:hover { background: var(--ez-surface-hover); }
</style>
