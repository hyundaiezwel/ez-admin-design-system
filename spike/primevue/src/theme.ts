import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

/**
 * 토큰 브리지 — @ezwel/ui → PrimeVue.
 *
 * PrimeVue는 3층이다(primitive → semantic → component). 값에 `var(--ez-*)`를 그대로
 * 넣을 수 있어서, primitive 두 계열(surface·primary)만 우리 스케일로 갈아 끼우면
 * **semantic이 전부 따라온다.** Aura가 그 위를 참조로만 쓰기 때문이다.
 *
 *   text.color        = {surface.700}
 *   text.mutedColor   = {surface.500}
 *   formField.placeholderColor = {surface.500}
 *   primary.color     = {primary.500}
 *
 * 스케일 자리 맞춤 — 양쪽 다 12/11단이라 자리 대 자리로 대응한다.
 *   surface 0  50  100 200 300 400 500 600 700 800 900 950
 *   ez-gray 0  5   10  20  30  40  50  60  70  80  90  95
 * 그래서 `{surface.500}`은 우리 gray-50(4.48:1), `{primary.500}`은 primary-50(4.50:1)에
 * 앉는다 — 대비 하한이 그대로 넘어온다.
 */
const ezSurface = {
  0: 'var(--ez-color-gray-0)',
  50: 'var(--ez-color-gray-5)',
  100: 'var(--ez-color-gray-10)',
  200: 'var(--ez-color-gray-20)',
  300: 'var(--ez-color-gray-30)',
  400: 'var(--ez-color-gray-40)',
  500: 'var(--ez-color-gray-50)',
  600: 'var(--ez-color-gray-60)',
  700: 'var(--ez-color-gray-70)',
  800: 'var(--ez-color-gray-80)',
  900: 'var(--ez-color-gray-90)',
  950: 'var(--ez-color-gray-95)',
}

const scale = (name: string) => ({
  50: `var(--ez-color-${name}-5)`,
  100: `var(--ez-color-${name}-10)`,
  200: `var(--ez-color-${name}-20)`,
  300: `var(--ez-color-${name}-30)`,
  400: `var(--ez-color-${name}-40)`,
  500: `var(--ez-color-${name}-50)`,
  600: `var(--ez-color-${name}-60)`,
  700: `var(--ez-color-${name}-70)`,
  800: `var(--ez-color-${name}-80)`,
  900: `var(--ez-color-${name}-90)`,
  950: `var(--ez-color-${name}-95)`,
})

export const EzPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: 'var(--ez-radius-sm)',
      md: 'var(--ez-radius-md)',
      lg: 'var(--ez-radius-lg)',
      xl: 'var(--ez-radius-lg)',
    },
    // severity 색도 우리 계열로 — Tag/Message가 이걸 참조한다
    green: scale('success'),
    red: scale('danger'),
    amber: scale('warning'),
    orange: scale('warning'),
    blue: scale('secondary'),
    sky: scale('secondary'),
  },
  semantic: {
    primary: scale('primary'),
    transitionDuration: 'var(--ez-duration-fast)',
    focusRing: {
      width: 'var(--ez-focus-ring-width)',
      style: 'solid',
      color: 'var(--ez-focus-ring-color)',
      offset: 'var(--ez-focus-ring-offset)',
    },
    formField: {
      // 우리 규격은 sm 28 / md 34 / lg 40. Aura 기본은 더 넉넉해서 여기서 좁힌다
      paddingX: 'var(--ez-space-3)',
      paddingY: '6px',
      borderRadius: 'var(--ez-radius-md)',
      sm: { fontSize: 'var(--ez-font-size-xs)', paddingX: 'var(--ez-space-2)', paddingY: '3px' },
      lg: { fontSize: 'var(--ez-font-size-md)', paddingX: 'var(--ez-space-4)', paddingY: '9px' },
    },
    content: { borderRadius: 'var(--ez-radius-lg)' },
    colorScheme: {
      light: {
        surface: ezSurface,
        primary: {
          color: '{primary.500}',
          contrastColor: 'var(--ez-text-inverse)',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
      dark: {
        surface: ezSurface,
        primary: {
          color: '{primary.300}',
          contrastColor: 'var(--ez-color-gray-95)',
          hoverColor: '{primary.200}',
          activeColor: '{primary.400}',
        },
      },
    },
  },
})
