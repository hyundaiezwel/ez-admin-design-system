<script setup lang="ts">
/**
 * WebSquare 구조 이관 셸.
 *
 * 사내 관리자센터(`websquare-bo-ui`)의 **레이아웃 골격을 그대로 옮긴 것**이다.
 * 눈대중이 아니라 `cm/css/base.css` 실측값을 따랐다.
 *
 *   .header  70px 세로 아이콘 레일, 배경 #000, position:fixed
 *   .side    280px 슬라이드 패널 (왼쪽 -210px에 숨어 있다가 밀려나온다)
 *   .menu_list 배경 #2a403d · .search_menu 배경 #000, 높이 52px
 *   .container left:70px · .contents min-width 1210px
 *   .sub_contents padding 30px 48px 24px
 *
 * 화면(`pages/*`)은 EZ 셸과 **같은 컴포넌트를 그대로 쓴다.** 다른 것은 셸과 스킨 CSS뿐이라
 * 두 구조를 같은 화면으로 비교할 수 있다.
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MENU, trail, type MenuItem } from '../app/menu'
import AppIcon from '../app/AppIcon.vue'

const route = useRoute()
const router = useRouter()

/**
 * 패널은 **접힌 채로 시작한다.** 원본의 기본 상태가 `left:-210px`이고 `.show_menu`가
 * 붙을 때만 열린다 — 레일 아이콘이나 하단 토글로 연다.
 */
const sideOpen = ref(false)
const activeTop = ref<string>('dashboard')

watch(
  () => route.path,
  (path) => {
    const p = path.replace(/^\/ws/, '') || '/'
    const top = MENU.find((m) => m.to === p || m.children?.some((c) => c.to === p))
    if (top) activeTop.value = top.id
  },
  { immediate: true },
)

const wsPath = (to: string) => `/ws${to === '/' ? '' : to}` || '/ws'
const isActive = (item: MenuItem) => route.path === wsPath(item.to ?? '')

function pickTop(item: MenuItem) {
  activeTop.value = item.id
  sideOpen.value = true
  if (item.to) router.push(wsPath(item.to))
}

const current = () => {
  const p = route.path.replace(/^\/ws/, '') || '/'
  return trail(p)
}
</script>

<template>
  <div class="ws" :class="{ 'ws--side': sideOpen }">
    <!-- 70px 세로 아이콘 레일 -->
    <div class="ws-header">
      <a class="ws-header__logo" @click="router.push('/ws')">EZ</a>
      <ul class="ws-header__nav">
        <li v-for="item in MENU" :key="item.id">
          <button
            type="button"
            class="ws-header__btn"
            :class="{ 'is-on': activeTop === item.id }"
            :aria-label="item.label"
            :aria-pressed="activeTop === item.id"
            @click="pickTop(item)"
          >
            <AppIcon :name="item.icon!" :size="20" />
          </button>
        </li>
      </ul>
      <button class="ws-header__toggle" type="button" :aria-label="sideOpen ? '메뉴 닫기' : '메뉴 열기'" @click="sideOpen = !sideOpen">
        <AppIcon name="menu" :size="18" />
      </button>
    </div>

    <!-- 280px 슬라이드 메뉴 패널 -->
    <nav class="ws-side" aria-label="주 메뉴">
      <div class="ws-side__search">
        <input class="ws-side__input" type="search" placeholder="메뉴 검색" aria-label="메뉴 검색" />
      </div>
      <div class="ws-side__list">
        <template v-for="item in MENU" :key="item.id">
          <div v-if="activeTop === item.id" class="ws-side__group">
            <p class="ws-side__gtit">{{ item.label }}</p>
            <template v-if="item.children">
              <RouterLink
                v-for="child in item.children"
                :key="child.id"
                class="ws-side__item"
                :class="{ 'is-on': isActive(child) }"
                :to="wsPath(child.to!)"
              >
                {{ child.label }}
              </RouterLink>
            </template>
            <RouterLink v-else class="ws-side__item" :class="{ 'is-on': isActive(item) }" :to="wsPath(item.to!)">
              {{ item.label }}
            </RouterLink>
          </div>
        </template>
      </div>
      <div class="ws-side__foot">
        <RouterLink to="/" class="ws-side__back">← EZ 디자인 셸로 돌아가기</RouterLink>
      </div>
    </nav>

    <!-- 본문 -->
    <div class="ws-container">
      <div class="ws-contents">
        <div class="ws-sub-contents">
          <!-- pgtbox: 타이틀 좌측 · 경로 우측 float. EZ 셸과 정반대다 -->
          <div class="ws-pgtbox">
            <span class="ws-pgt-tit">{{ current()?.leaf?.label ?? current()?.top.label ?? '화면' }}</span>
            <ul class="ws-breadcrumb">
              <li class="home"><span>홈</span></li>
              <li v-if="current()"><span>{{ current()!.top.label }}</span></li>
              <li v-if="current()?.leaf" class="last"><span>{{ current()!.leaf!.label }}</span></li>
            </ul>
          </div>

          <RouterView v-slot="{ Component }">
            <KeepAlive :max="6">
              <component :is="Component" :key="route.path" />
            </KeepAlive>
          </RouterView>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 값은 전부 websquare-bo-ui/cm/css/base.css 실측이다 */
.ws { position: relative; height: 100%; overflow: hidden; background: #fff; }

.ws-header {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  background: #000;
  z-index: 1000;
}

.ws-header__logo {
  display: grid; place-items: center;
  width: 100%; height: 52px;
  color: #fff; font-size: 1.4rem; font-weight: 700; cursor: pointer;
}

.ws-header__nav { flex: 1; list-style: none; margin: 0; padding: 8px 0; width: 100%; background: #2a403d; }

.ws-header__btn {
  display: grid; place-items: center;
  width: 100%; height: 56px;
  border: none; background: none; color: #9aa8a5; cursor: pointer;
}
.ws-header__btn:hover { color: #fff; background: #1f302e; }
.ws-header__btn.is-on { color: #fff; background: #1D2023; box-shadow: inset 3px 0 0 #009782; }

.ws-header__toggle {
  width: 100%; height: 44px;
  border: none; background: #1D2023; color: #9aa8a5; cursor: pointer;
}

.ws-side {
  position: absolute;
  top: 0; bottom: 0;
  left: -210px;
  width: 280px;
  padding-left: 70px;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
  z-index: 999;
  transition: left .3s;
}
/* 원본의 `.show_menu` 규칙 그대로 — 패널이 열리면 본문이 280px로 밀리고
   최소 폭이 1210 → 1000으로 준다. 패널이 본문을 덮지 않는다 */
.ws--side .ws-side { left: 0; z-index: auto; }
.ws--side .ws-container { left: 280px; }
.ws--side .ws-contents { min-width: 1000px; }

.ws-side__search { height: 52px; padding: 8px 12px 8px 0; background: #000; box-sizing: border-box; }
.ws-side__input {
  width: 100%; height: 32px; padding: 0 12px;
  border: 0; border-radius: 4px;
  background: #2D3843; color: #ddd; font-size: 1.3rem;
  box-sizing: border-box;
}
.ws-side__input::placeholder { color: #aaa; }

.ws-side__list { flex: 1; overflow: auto; padding: 12px 12px 12px 0; }
.ws-side__gtit { margin: 0 0 8px; padding: 0 8px; color: #999; font-size: 1.2rem; font-weight: 700; }
.ws-side__item {
  display: block;
  padding: 9px 10px;
  color: #444; font-size: 1.4rem; text-decoration: none;
  border-radius: 4px;
}
.ws-side__item:hover { background: #f3f5f6; }
.ws-side__item.is-on { color: #009782; font-weight: 700; background: #edfefb; }

.ws-side__foot { padding: 12px 12px 12px 0; border-top: 1px solid #eee; }
.ws-side__back { color: #727272; font-size: 1.2rem; text-decoration: none; }
.ws-side__back:hover { color: #009782; }

.ws-container {
  position: absolute;
  left: 70px; top: 0; right: 0; bottom: 0;
  background: #fff;
  overflow: auto;
  transition: all .3s;
}

.ws-contents { position: relative; min-width: 1210px; min-height: 100%; }
.ws-sub-contents { position: relative; padding: 30px 48px 24px; }

/* pgtbox — 타이틀 2rem/700, 경로는 우측 float */
.ws-pgtbox { position: relative; width: 100%; margin: 0 0 18px; }
.ws-pgtbox::after { content: ''; display: block; clear: both; }
.ws-pgt-tit { display: inline-block; margin-right: 12px; color: #222; font-size: 2rem; font-weight: 700; vertical-align: middle; }

.ws-breadcrumb { float: right; margin: 4px 0 0; list-style: none; padding: 0; }
.ws-breadcrumb li { display: inline-block; position: relative; margin-left: 12px; font-size: 1.5rem; vertical-align: middle; }
.ws-breadcrumb li span { position: relative; padding-right: 16px; color: #5E5E5E; }
.ws-breadcrumb li span::after {
  position: absolute; content: ''; display: block;
  width: 5px; height: 5px; top: 6px; right: 0;
  border-top: 1px solid #999; border-right: 1px solid #999;
  transform: rotate(45deg);
}
.ws-breadcrumb li.last span { color: #171717; font-weight: 600; padding-right: 0; }
.ws-breadcrumb li.last span::after { display: none; }
</style>
