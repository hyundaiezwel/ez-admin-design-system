import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import WsShell from '../layouts/WsShell.vue'
import { titleOf } from '../app/menu'

/**
 * 해시 히스토리를 쓴다 — GitHub Pages는 정적 호스팅이라 `/sales/orders` 같은 깊은 주소를
 * 새로고침하면 404가 난다. SPA 폴백을 넣는 우회(404.html 복제)도 있지만, 목업에서
 * 주소 모양보다 "링크가 항상 열린다"가 중요하다.
 *
 * 화면은 전부 lazy import다. echarts가 들어간 통계 화면이 첫 로드에 끌려오지 않게 한다.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', name: 'login', component: () => import('../pages/LoginPage.vue') }],
  },
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', component: () => import('../pages/DashboardPage.vue') },
      { path: 'cs/inquiries', component: () => import('../pages/InquiryPage.vue') },
      { path: 'cs/members', component: () => import('../pages/MemberPage.vue') },
      { path: 'sales/promotions', component: () => import('../pages/PromotionPage.vue') },
      { path: 'sales/orders', component: () => import('../pages/OrderPage.vue') },
      { path: 'sales/products', component: () => import('../pages/ProductFormPage.vue') },
      { path: 'stats', component: () => import('../pages/StatsPage.vue') },
      { path: 'system/catalog', component: () => import('../pages/CatalogPage.vue') },
      { path: 'system/codes', component: () => import('../pages/CodePage.vue') },
    ],
  },
  /**
   * WebSquare 구조 이관판. **화면 컴포넌트는 위와 같은 것을 쓴다** —
   * 다른 것은 셸과 스킨 CSS뿐이라 두 구조를 같은 화면으로 비교할 수 있다.
   */
  {
    path: '/ws',
    component: WsShell,
    children: [
      { path: '', component: () => import('../pages/DashboardPage.vue') },
      { path: 'cs/inquiries', component: () => import('../pages/InquiryPage.vue') },
      { path: 'cs/members', component: () => import('../pages/MemberPage.vue') },
      { path: 'sales/promotions', component: () => import('../pages/PromotionPage.vue') },
      { path: 'sales/orders', component: () => import('../pages/OrderPage.vue') },
      { path: 'sales/products', component: () => import('../pages/ProductFormPage.vue') },
      { path: 'stats', component: () => import('../pages/StatsPage.vue') },
      { path: 'system/catalog', component: () => import('../pages/CatalogPage.vue') },
      { path: 'system/codes', component: () => import('../pages/CodePage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const ws = to.path.startsWith('/ws')
  const path = ws ? to.path.replace(/^\/ws/, '') || '/' : to.path
  const name = path === '/login' ? '로그인' : titleOf(path)
  document.title = `${name} — ${ws ? 'WebSquare 이관판' : 'EZ Admin'}`
})
