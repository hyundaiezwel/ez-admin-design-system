import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [
    vue(),
    // 의미 색 별칭을 우리 램프로 돌린다. `neutral`은 타입이 고정 목록이라 여기서 못 바꾸고
    // CSS의 `--ui-color-neutral-*` 덮어쓰기로 처리한다 — 두 경로가 갈리는 것도 비용이다.
    ui({
      ui: {
        colors: {
          primary: 'ezteal',
          secondary: 'ezinfo',
          info: 'ezinfo',
          success: 'ezsuccess',
          warning: 'ezwarn',
          error: 'ezdanger',
        },
      },
    }),
  ],
  // 워크스페이스 루트의 fixtures/shared 를 dev 서버가 읽을 수 있게 한다
  server: { port: 5310, fs: { allow: ['../..'] } },
})
