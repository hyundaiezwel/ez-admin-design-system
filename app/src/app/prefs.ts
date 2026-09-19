import { reactive, watchEffect } from 'vue'

/**
 * 셸 표시 설정. 화면이 아니라 셸의 성질이라 화면마다 들고 다니지 않는다.
 *
 * `darkChrome` — **부분 다크**다. 헤더·LNB만 어둡고 본문은 밝다.
 * 루트 전체를 뒤집는 `theme`과는 다른 축이고, 둘은 같이 켤 수 있다.
 */
export const prefs = reactive({
  theme: 'light' as 'light' | 'dark',
  contrast: false,
  fontScale: 1,
  darkChrome: true,
})

export function applyPrefs() {
  watchEffect(() => {
    const root = document.documentElement
    root.dataset.theme = prefs.theme
    if (prefs.contrast) root.dataset.contrast = 'high'
    else delete root.dataset.contrast
    root.dataset.fontScale = String(prefs.fontScale)
  })
}

/** 셸 조각(헤더·LNB)에 붙일 속성. 본문에는 걸지 않는다 */
export const chromeScheme = () => (prefs.darkChrome && prefs.theme === 'light' ? 'dark' : undefined)
