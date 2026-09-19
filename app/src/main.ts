import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { router } from './router'
import { EzPreset } from './theme'
import './styles/main.css'
import { applyPrefs } from './app/prefs'

applyPrefs()

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: EzPreset,
      options: {
        // 우리 토큰 규약을 그대로 쓴다 — 브리지가 필요 없다(스파이크 결론)
        darkModeSelector: '[data-theme="dark"]',
        cssLayer: false,
      },
    },
    ripple: false,
  })
  .mount('#app')
