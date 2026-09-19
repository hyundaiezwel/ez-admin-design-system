import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { EzPreset } from './theme'
import './main.css'
import { install } from '../../../shared/measure'
import { SAMPLES, DENSITY_TARGETS } from '../../../shared/samples'

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: EzPreset,
      options: {
        // 우리 토큰 규약을 그대로 쓴다 — Nuxt UI에서 필요했던 `.dark` 브리지가 없다
        darkModeSelector: '[data-theme="dark"]',
        cssLayer: false,
      },
    },
    ripple: false,
  })
  .mount('#app')

install(SAMPLES, DENSITY_TARGETS)
