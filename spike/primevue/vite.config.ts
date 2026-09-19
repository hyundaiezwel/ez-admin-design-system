import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 자동 임포트 리졸버는 안 쓴다 — v5용만 배포돼 v4와 메이저가 어긋난다.
// 스파이크 규모에서는 명시적 import가 오히려 무엇이 어디서 오는지 분명하다.
export default defineConfig({
  // 프로젝트 페이지는 하위 경로로 뜬다. 로컬은 루트라 기본값 '/'.
  base: process.env.PAGES_BASE || '/',
  plugins: [vue()],
  server: { port: 5320, fs: { allow: ['../..'] } },
})
