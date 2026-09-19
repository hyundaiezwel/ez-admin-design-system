import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@fixtures': fileURLToPath(new URL('../fixtures', import.meta.url)),
    },
  },
  server: { port: 5300, fs: { allow: ['..'] } },
  build: {
    // echarts·tabulator가 한 덩어리로 묶이면 첫 로드가 무거워진다. 라우트 단위로 쪼갠다
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts', 'vue-echarts'],
          tabulator: ['tabulator-tables'],
          primevue: ['primevue/config', '@primevue/themes'],
        },
      },
    },
  },
})
