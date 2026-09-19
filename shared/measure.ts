/**
 * 스파이크 계측 — 화면에 **실제로 그려진 색**에서 대비비를 잰다.
 *
 * 토큰 정의를 읽어 계산하면 라이브러리가 그 토큰을 실제로 쓰는지 알 수 없다.
 * 그게 이번 측정의 핵심 질문이라 `getComputedStyle`로 렌더 결과만 본다.
 *
 * `window.__measure()`로 노출해 브라우저에서 바로 호출한다.
 */

type Rgb = [number, number, number]
type Rgba = [number, number, number, number]

/**
 * 어떤 CSS 색 표기든 rgb로 바꾼다.
 *
 * 정규식으로 `rgb()`만 파싱했더니 Nuxt UI 뱃지에서 전부 실패했다 — Tailwind v4가
 * `oklch()` / `oklab()`으로 색을 낸다. 캔버스에 칠해 픽셀을 읽으면 표기와 무관하게 값이 나온다.
 */
let ctx: CanvasRenderingContext2D | null = null
function parse(css: string): Rgba | null {
  const v = (css || '').trim()
  if (!v || v === 'transparent' || v === 'rgba(0, 0, 0, 0)') return null
  const m = v.match(/^rgba?\(([^)]+)\)$/i)
  if (m) {
    const [r, g, b, a] = m[1].split(/[,/\s]+/).filter(Boolean).map(Number)
    return [r, g, b, a === undefined ? 1 : a]
  }
  if (!ctx) ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillStyle = v
  if (ctx.fillStyle === '#000000' && !/^#0{3,6}$|black/i.test(v)) return null
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2], d[3] / 255]
}

function lum([r, g, b]: Rgb) {
  const f = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function ratio(a: Rgb, b: Rgb) {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** 배경이 투명한 요소는 조상에서 실제로 칠해진 색을 찾아 올라간다 */
/**
 * 요소 뒤에 실제로 보이는 색.
 *
 * 반투명 배경(예: Nuxt UI `subtle` 뱃지의 `bg-info/10`)은 **뒤 색과 합성해야** 한다.
 * 합성 없이 재면 글자색과 배경색이 같은 계열이라 대비가 1.0 근처로 나온다 —
 * 실제 화면은 멀쩡한데 측정만 실패하는 가짜 결과가 된다.
 */
function effectiveBg(el: Element): Rgb {
  const layers: Rgba[] = []
  let node: Element | null = el
  while (node) {
    const c = parse(getComputedStyle(node).backgroundColor)
    if (c && c[3] > 0) {
      layers.push(c)
      if (c[3] >= 1) break
    }
    node = node.parentElement
  }
  // 가장 아래(불투명)부터 위로 덮어 나간다
  let out: Rgb = [255, 255, 255]
  for (let i = layers.length - 1; i >= 0; i--) {
    const [r, g, b, a] = layers[i]
    out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)]
  }
  return out
}

export interface Sample {
  label: string
  selector: string
  /** 4.5 = 본문, 3 = 큰 글씨·UI 요소 */
  need: 3 | 4.5
}

export interface Result extends Sample {
  found: boolean
  fg?: string
  bg?: string
  ratio?: number
  pass?: boolean
  fontPx?: number
  heightPx?: number
}

export function measure(samples: Sample[]): Result[] {
  return samples.map((s) => {
    const el = document.querySelector(s.selector)
    if (!el) return { ...s, found: false }
    const cs = getComputedStyle(el)
    const fgRaw = parse(cs.color)
    const bg = effectiveBg(el)
    if (!fgRaw) return { ...s, found: false }
    const a = fgRaw[3]
    const fg: Rgb = [
      fgRaw[0] * a + bg[0] * (1 - a),
      fgRaw[1] * a + bg[1] * (1 - a),
      fgRaw[2] * a + bg[2] * (1 - a),
    ]
    const r = ratio(fg, bg)
    return {
      ...s,
      found: true,
      fg: cs.color,
      bg: `rgb(${bg.map((n) => Math.round(n)).join(', ')})`,
      ratio: Math.round(r * 100) / 100,
      pass: r >= s.need,
      fontPx: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      heightPx: Math.round((el as HTMLElement).getBoundingClientRect().height * 10) / 10,
    }
  })
}

export interface DensityTarget {
  label: string
  selector: string
  /** 우리 규격값(px). 벗어난 만큼이 곧 맞추는 데 드는 일이다 */
  expect: number
}

export function density(targets: DensityTarget[]) {
  return targets.map((t) => {
    const el = document.querySelector(t.selector) as HTMLElement | null
    if (!el) return { ...t, found: false }
    const h = Math.round(el.getBoundingClientRect().height * 10) / 10
    return { ...t, found: true, actual: h, delta: Math.round((h - t.expect) * 10) / 10 }
  })
}

export function install(samples: Sample[], targets: DensityTarget[] = []) {
  ;(window as any).__measure = () => measure(samples)
  ;(window as any).__density = () => density(targets)
  ;(window as any).__samples = samples
}
