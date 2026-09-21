<script setup lang="ts">
/**
 * 좌측 메뉴(LNB).
 *
 * 규칙은 `docs/navigation.md`에 있다. 요약하면 둘이다.
 *
 * 1. **두 구역** — 주 메뉴는 남는 공간을 전부 먹고, 하단 구역은 바닥에 붙는다.
 *    "어디로 가나"와 "시스템에 관한 것"은 성격이 달라서 자리가 고정이어야 한다.
 * 2. **접힘은 좁은 사이드바가 아니라 레일이다** — 라벨을 자르지 않는다.
 *    잘린 글자는 정보가 아니라 소음이다. 하위는 플라이아웃으로 낸다.
 *
 * 열림 상태는 화면마다 기억하지 않고 셸이 하나로 들고 있다.
 */
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MENU, MENU_FOOT, groupCount, type MenuItem } from './menu'
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

/** 접으면 플라이아웃만 남으므로 열림 상태를 들고 있을 이유가 없다 */
watch(
  () => props.collapsed,
  (c) => { if (c) flyout.value = null },
)

const isActive = (item: MenuItem) => item.to === route.path
const groupActive = (item: MenuItem) => item.children?.some((c) => c.to === route.path) ?? false

function toggle(item: MenuItem) {
  if (!item.children) return
  const s = new Set(open.value)
  s.has(item.id) ? s.delete(item.id) : s.add(item.id)
  open.value = s
}

/** 999를 넘으면 자릿수가 늘어 행 폭이 흔들린다. 넘치면 999+로 고정한다 */
const fmt = (n: number) => (n > 999 ? '999+' : String(n))
</script>

<template>
  <nav class="lnb" :class="{ 'lnb--rail': collapsed }" :data-scheme="chromeScheme()" aria-label="주 메뉴">
    <!-- 주 메뉴 — 넘치면 여기만 스크롤한다. 사이드바 전체가 스크롤되면 하단이 밀린다 -->
    <div class="lnb__nav ez-scroll">
      <ul class="lnb__list">
        <li v-for="item in MENU" :key="item.id" class="lnb__group" @mouseleave="flyout = null">
          <!-- 잎 노드는 링크, 가지는 버튼. 역할이 다르면 태그도 달라야 키보드 동작이 맞는다 -->
          <RouterLink
            v-if="item.to"
            class="lnb__row"
            :class="{ 'lnb__row--on': isActive(item) }"
            :to="item.to"
            :title="collapsed ? item.label : undefined"
            :aria-current="isActive(item) ? 'page' : undefined"
            @mouseenter="flyout = null"
          >
            <span class="lnb__icon"><AppIcon :name="item.icon!" :size="18" /></span>
            <span v-if="!collapsed" class="lnb__label">{{ item.label }}</span>
            <span v-if="!collapsed && item.count" class="lnb__count">{{ fmt(item.count) }}</span>
            <span v-else-if="collapsed && item.count" class="lnb__dot" />
          </RouterLink>

          <button
            v-else
            class="lnb__row"
            :class="{ 'lnb__row--on': groupActive(item) && collapsed, 'lnb__row--within': groupActive(item) && !collapsed }"
            type="button"
            :title="collapsed ? item.label : undefined"
            :aria-expanded="collapsed ? undefined : open.has(item.id)"
            :aria-label="groupCount(item) ? `${item.label}, 대기 ${groupCount(item)}건` : undefined"
            @click="toggle(item)"
            @mouseenter="collapsed && (flyout = item.id)"
            @focus="collapsed && (flyout = item.id)"
          >
            <span class="lnb__icon"><AppIcon :name="item.icon!" :size="18" /></span>
            <template v-if="!collapsed">
              <span class="lnb__label">{{ item.label }}</span>
              <span v-if="groupCount(item) && !open.has(item.id)" class="lnb__count">{{ fmt(groupCount(item)) }}</span>
              <AppIcon name="chevron" :size="14" class="lnb__chev" :class="{ 'lnb__chev--open': open.has(item.id) }" />
            </template>
            <span v-else-if="groupCount(item)" class="lnb__dot" />
          </button>

          <ul v-if="!collapsed && item.children && open.has(item.id)" class="lnb__sub">
            <li v-for="child in item.children" :key="child.id">
              <RouterLink
                class="lnb__row lnb__row--sub"
                :class="{ 'lnb__row--on': isActive(child) }"
                :to="child.to!"
                :aria-current="isActive(child) ? 'page' : undefined"
                :aria-label="child.count ? `${child.label}, 대기 ${child.count}건` : undefined"
              >
                <span class="lnb__label">{{ child.label }}</span>
                <span v-if="child.count" class="lnb__count">{{ fmt(child.count) }}</span>
              </RouterLink>
            </li>
          </ul>

          <!-- 레일 플라이아웃. 참조 디자인은 접히면 하위에 갈 길이 없다 — 이건 우리가 낫다 -->
          <div v-if="collapsed && item.children && flyout === item.id" class="lnb__flyout">
            <p class="lnb__flyout-head">{{ item.label }}</p>
            <RouterLink
              v-for="child in item.children"
              :key="child.id"
              class="lnb__row lnb__row--sub"
              :class="{ 'lnb__row--on': isActive(child) }"
              :to="child.to!"
            >
              <span class="lnb__label">{{ child.label }}</span>
              <span v-if="child.count" class="lnb__count">{{ fmt(child.count) }}</span>
            </RouterLink>
          </div>
        </li>
      </ul>
    </div>

    <!-- 하단 고정. 메뉴가 길어져도 바닥에 붙어 있어야 찾는 비용이 0이다 -->
    <div class="lnb__foot">
      <RouterLink
        v-for="item in MENU_FOOT"
        :key="item.id"
        class="lnb__row"
        :to="item.to!"
        :title="collapsed ? item.label : undefined"
      >
        <span class="lnb__icon"><AppIcon :name="item.icon!" :size="18" /></span>
        <span v-if="!collapsed" class="lnb__label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
/* 폭은 둘 다 고정이고 비는 3.75:1이다(참조에서 잰 값). 64 = 240 ÷ 3.75.
   종전에는 `var(--lnb-w)`를 쓰면서 어디에도 정의하지 않아 `width: auto`로
   떨어져 있었다 — 내용 폭으로 서 있었고 전환 애니메이션도 죽어 있었다. */
.lnb {
  --lnb-w: 240px;
  --lnb-w-collapsed: 64px;
  --lnb-row-h: var(--ez-size-lg);
  --lnb-icon: 20px;
  --lnb-pad: var(--ez-gap-intra);

  flex: none;
  width: var(--lnb-w);
  display: flex;
  flex-direction: column;
  background: var(--ez-surface-default);
  border-right: 1px solid var(--ez-border-default);
  transition: width var(--ez-duration-normal) var(--ez-easing-standard);
}

.lnb--rail { width: var(--lnb-w-collapsed); }

/* 주 메뉴가 남는 공간을 전부 먹는다 — 그래야 하단이 바닥에 붙는다 */
.lnb__nav { flex: 1; min-height: 0; overflow-y: auto; overflow-x: visible; }
.lnb__list { list-style: none; margin: 0; padding: var(--lnb-pad); display: flex; flex-direction: column; gap: var(--ez-space-0-5); }
.lnb__group { position: relative; }

.lnb__foot {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--ez-space-0-5);
  padding: var(--lnb-pad);
  border-top: 1px solid var(--ez-border-subtle, var(--ez-border-default));
}

.lnb__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ez-gap-intra);
  width: 100%;
  height: var(--lnb-row-h);
  padding: 0 var(--ez-gap-intra);
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

/* 아이콘 상자를 고정해야 라벨 시작점이 행마다 안 흔들린다.
   눈이 세로 한 줄을 못 따라가면 목록 읽는 속도가 떨어진다. */
.lnb__icon { flex: none; display: grid; place-items: center; width: var(--lnb-icon); color: var(--ez-icon-default); }

/* 2depth는 1depth **라벨과 같은 축**에서 시작한다. 계층은 크기·색으로 이미 말했고
   거리로 또 말하면 두 번 말하는 것이다(원칙 공리 ④). */
.lnb__row--sub {
  height: var(--ez-size-md);
  padding-left: calc(var(--ez-gap-intra) * 2 + var(--lnb-icon));
  color: var(--ez-text-muted);
  font-size: var(--ez-font-size-xs);
}
.lnb__row--sub:hover { color: var(--ez-text-default); }

/* 상태는 셋으로 말한다 — 배경·글자색·좌측 막대. 색 하나로는 고대비·색각이상에서 무너진다 */
.lnb__row--on {
  background: var(--ez-surface-selected);
  color: var(--ez-text-brand);
  font-weight: var(--ez-font-weight-bold);
}
.lnb__row--on::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  translate: 0 -50%;
  width: 3px;
  height: 60%;
  border-radius: 0 var(--ez-radius-sm) var(--ez-radius-sm) 0;
  background: var(--ez-action-primary);
}
.lnb__row--on .lnb__icon { color: var(--ez-text-brand); }

/* 활성 화면을 품은 그룹. 활성 행과 구별돼야 하므로 배경을 주지 않는다 */
.lnb__row--within { color: var(--ez-text-strong); font-weight: var(--ez-font-weight-bold); }

.lnb__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lnb__chev { flex: none; transition: transform var(--ez-duration-fast) var(--ez-easing-standard); color: var(--ez-icon-muted); }
.lnb__chev--open { transform: rotate(180deg); }

/* 건수는 숫자로 쓴다 — 점만 찍으면 "지금 봐야 하나"가 전달되지 않는다 */
.lnb__count {
  flex: none;
  min-width: 20px;
  padding: 0 var(--ez-space-1);
  border-radius: var(--ez-radius-full);
  background: var(--ez-action-danger);
  color: var(--ez-text-inverse);
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-bold);
  font-variant-numeric: tabular-nums;
  text-align: center;
  line-height: 1.5;
}

/* 레일에서는 숫자가 안 들어가므로 점으로 낮춘다. 건수는 aria-label에 남아 있다 */
.lnb__dot {
  position: absolute;
  top: 7px;
  right: 9px;
  width: 6px;
  height: 6px;
  border-radius: var(--ez-radius-full);
  background: var(--ez-action-danger);
}

.lnb--rail .lnb__row { justify-content: center; padding: 0; }
.lnb--rail .lnb__list, .lnb--rail .lnb__foot { padding: var(--ez-gap-intra) var(--ez-space-1); }

.lnb__sub { list-style: none; margin: var(--ez-space-0-5) 0 var(--ez-space-1); padding: 0; display: flex; flex-direction: column; gap: var(--ez-space-0-5); }

.lnb__flyout {
  position: absolute;
  left: 100%;
  top: 0;
  z-index: var(--ez-z-dropdown);
  min-width: var(--lnb-w);
  margin-left: var(--ez-space-1);
  padding: var(--ez-space-2);
  background: var(--ez-surface-raised);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-md);
  box-shadow: var(--ez-shadow-overlay);
}
.lnb__flyout .lnb__row--sub { padding-left: var(--ez-gap-intra); }

.lnb__flyout-head {
  margin: 0 0 var(--ez-space-1);
  padding: 0 var(--ez-gap-intra);
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-bold);
  color: var(--ez-text-muted);
}
</style>
