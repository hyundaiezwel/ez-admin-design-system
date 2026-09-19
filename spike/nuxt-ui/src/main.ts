import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import './main.css'
import { install } from '../../../shared/measure'
import { SAMPLES, DENSITY_TARGETS } from '../../../shared/samples'

/**
 * 테마 브리지 — Nuxt UI는 `.dark` 클래스로, 우리 토큰은 `[data-theme]`로 다크를 켠다.
 *
 * **이게 없으면 조용히 어긋난다.** 실측에서 Nuxt UI가 OS 설정을 보고 `html.dark`를
 * 스스로 달았는데 `data-theme`는 light로 남아, 라이트 토큰 위에 다크 컴포넌트 스타일이
 * 얹혀 CTA 대비가 1.98:1까지 떨어졌다. 오류는 나지 않았다.
 *
 * 우리 쪽을 정본으로 삼고 클래스를 따라 붙인다.
 */
function bridgeTheme() {
  const root = document.documentElement
  const apply = () => {
    const wantDark = root.dataset.theme === 'dark'
    if (root.classList.contains('dark') !== wantDark) root.classList.toggle('dark', wantDark)
  }
  // `class`까지 감시한다 — Nuxt UI가 색 모드를 스스로 관리해서, data-theme만 보면
  // 라이브러리가 나중에 다시 붙이는 `.dark`를 놓친다. 같은 값이면 쓰지 않으므로 루프는 없다.
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] })
  apply()
}

bridgeTheme()
createApp(App).use(ui).mount('#app')
install(SAMPLES, DENSITY_TARGETS)
