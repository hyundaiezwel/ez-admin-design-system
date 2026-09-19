<script setup lang="ts">
/**
 * 멀티 탭 바.
 *
 * 탭이 넘치면 좌우 이동 버튼이 나타난다 — 스크롤바를 노출하는 대신 버튼을 쓰는 이유는
 * 업무 화면에서 마우스 휠이 본문 스크롤과 다투기 때문이다.
 */
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { tabs, close } from './tabs'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const scroller = ref<HTMLElement | null>(null)
const overflow = ref(false)

function measure() {
  const el = scroller.value
  overflow.value = !!el && el.scrollWidth > el.clientWidth + 1
}

watch(() => tabs.items.length, async () => { await nextTick(); measure() }, { immediate: true })

const move = (dir: -1 | 1) => scroller.value?.scrollBy({ left: dir * 200, behavior: 'smooth' })
const active = computed(() => tabs.active)
</script>

<template>
  <div class="tb">
    <button v-if="overflow" class="tb__nav" type="button" aria-label="이전 탭 보기" @click="move(-1)">
      <AppIcon name="chevron" :size="14" style="transform: rotate(90deg)" />
    </button>

    <div ref="scroller" class="tb__scroll" role="tablist" aria-label="열린 화면">
      <div
        v-for="t in tabs.items"
        :key="t.path"
        class="tb__item"
        :class="{ 'tb__item--on': t.path === active }"
        role="tab"
        :aria-selected="t.path === active"
        tabindex="0"
        @click="router.push(t.path)"
        @keydown.enter="router.push(t.path)"
        @keydown.space.prevent="router.push(t.path)"
      >
        <span class="tb__label">{{ t.title }}</span>
        <button
          v-if="!t.fixed"
          class="tb__close"
          type="button"
          :aria-label="`${t.title} 탭 닫기`"
          @click.stop="close(t.path, router)"
        >
          <AppIcon name="close" :size="12" />
        </button>
      </div>
    </div>

    <button v-if="overflow" class="tb__nav" type="button" aria-label="다음 탭 보기" @click="move(1)">
      <AppIcon name="chevron" :size="14" style="transform: rotate(-90deg)" />
    </button>
  </div>
</template>

<style scoped>
.tb {
  flex: none;
  display: flex;
  align-items: stretch;
  gap: var(--ez-space-1);
  height: 38px;
  padding: 0 var(--ez-space-2);
  background: var(--ez-surface-sunken);
  border-bottom: 1px solid var(--ez-border-default);
}

.tb__scroll { flex: 1; display: flex; align-items: stretch; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.tb__scroll::-webkit-scrollbar { display: none; }

.tb__item {
  display: flex;
  align-items: center;
  gap: var(--ez-space-1);
  padding: 0 var(--ez-space-2) 0 var(--ez-space-3);
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--ez-radius-sm) var(--ez-radius-sm) 0 0;
  color: var(--ez-text-muted);
  font-size: var(--ez-font-size-xs);
  white-space: nowrap;
  cursor: pointer;
}

.tb__item:hover { background: var(--ez-surface-hover); }

/* 활성 탭은 배경 + 상단 막대 둘로 표시한다. 배경만으로는 대비가 안 난다 */
.tb__item--on {
  background: var(--ez-surface-default);
  border-color: var(--ez-border-default);
  box-shadow: inset 0 2px 0 var(--ez-action-primary);
  color: var(--ez-text-strong);
  font-weight: var(--ez-font-weight-bold);
}

.tb__close {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: var(--ez-radius-sm);
  background: none;
  color: var(--ez-icon-muted);
  cursor: pointer;
}
.tb__close:hover { background: var(--ez-surface-hover); color: var(--ez-text-default); }

.tb__nav {
  flex: none;
  width: 24px;
  border: none;
  background: none;
  color: var(--ez-icon-default);
  cursor: pointer;
}
</style>
