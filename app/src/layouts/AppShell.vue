<script setup lang="ts">
/**
 * 앱 셸 — 헤더 고정 · LNB 좌측 · 탭 바 · 본문만 스크롤.
 *
 * 디자인 시스템이 일부러 안 만든 조각이다(프로젝트마다 정보구조가 다르다).
 * 여기서 먼저 세우고, 굳으면 `@ezwel/ui`로 승격 후보가 된다.
 *
 * 스크롤이 본문에만 걸리는 것이 핵심이다 — 페이지 전체가 스크롤되면 조회 조건이
 * 화면 밖으로 밀려 목록을 보면서 조건을 못 고친다.
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../app/AppHeader.vue'
import AppLnb from '../app/AppLnb.vue'
import AppTabBar from '../app/AppTabBar.vue'
import AppIcon from '../app/AppIcon.vue'
import { trail } from '../app/menu'
import { open } from '../app/tabs'

const route = useRoute()
const collapsed = ref(false)

watch(() => route.path, (p) => open(p), { immediate: true })
</script>

<template>
  <div class="shell">
    <a class="ez-skip-link" href="#main">본문 바로가기</a>
    <AppHeader :collapsed="collapsed" @toggle-lnb="collapsed = !collapsed" />

    <div class="shell__body">
      <AppLnb :collapsed="collapsed" />

      <div class="shell__right">
        <AppTabBar />

        <nav class="crumb" aria-label="현재 위치">
          <AppIcon name="grid" :size="13" />
          <template v-if="trail(route.path)">
            <span class="crumb__sep">›</span>
            <span>{{ trail(route.path)!.top.label }}</span>
            <template v-if="trail(route.path)!.leaf">
              <span class="crumb__sep">›</span>
              <span class="crumb__leaf">{{ trail(route.path)!.leaf!.label }}</span>
            </template>
          </template>
        </nav>

        <!-- tabindex=-1 이라야 본문 바로가기로 포커스가 실제로 옮겨진다 -->
        <main id="main" class="shell__main ez-scroll" tabindex="-1">
          <RouterView v-slot="{ Component }">
            <!-- 탭을 오갈 때 목록·조회조건이 살아 있어야 한다 -->
            <KeepAlive :max="8">
              <component :is="Component" :key="route.path" />
            </KeepAlive>
          </RouterView>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: var(--ez-layout-min-width);
  background: var(--ez-surface-canvas);
}

.shell__body { flex: 1; display: flex; min-height: 0; }
.shell__right { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.crumb {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--ez-space-1);
  padding: var(--ez-space-2) var(--ez-space-6) 0;
  color: var(--ez-text-muted);
  font-size: var(--ez-font-size-2xs);
}
.crumb__sep { color: var(--ez-text-disabled); }
.crumb__leaf { color: var(--ez-text-default); font-weight: var(--ez-font-weight-medium); }

.shell__main { flex: 1; min-height: 0; padding: var(--ez-space-4) var(--ez-space-6) var(--ez-space-8); }
.shell__main:focus { outline: none; }
</style>
