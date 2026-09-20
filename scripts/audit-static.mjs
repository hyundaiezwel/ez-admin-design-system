import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

/**
 * 설계 원칙 정적 감사 — 소스에서 잡히는 것만 본다.
 *
 * 렌더해야 알 수 있는 것(여백 비율, 대비)은 `audit-live` 쪽이다. 여기서는
 * "코드를 읽으면 알 수 있는 위반"을 센다.
 *
 * 규칙 출처: ez-design-system/docs/principles.md
 */
const dir = fileURLToPath(new URL('../app/src/pages', import.meta.url))
const files = readdirSync(dir).filter((f) => f.endsWith('.vue'))

/** 토큰이 아닌 리터럴. 0·1px·100%·999px 같은 구조값은 뺀다 */
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const RAW_PX = /:\s*(?!0px)(\d{2,}px)/g
const ALLOWED_PX = new Set(['1px', '2px', '3px', '100px'])

const findings = []
const rows = []

for (const file of files) {
  const src = readFileSync(join(dir, file), 'utf8')
  const styleBlock = (src.match(/<style[\s\S]*?<\/style>/) ?? [''])[0]
  const template = (src.match(/<template>[\s\S]*<\/template>/) ?? [''])[0]

  const add = (rule, severity, detail) => findings.push({ file, rule, severity, detail })

  // §9 ⑦ 토큰만 쓰는가
  const hexes = [...styleBlock.matchAll(HEX)].map((m) => m[0])
  if (hexes.length) add('§9⑦ 토큰만', 'high', `hex 리터럴 ${hexes.length}개: ${[...new Set(hexes)].slice(0, 4).join(' ')}`)

  const pxs = [...styleBlock.matchAll(RAW_PX)].map((m) => m[1]).filter((p) => !ALLOWED_PX.has(p))
  if (pxs.length) add('§9⑦ 토큰만', 'med', `px 리터럴 ${pxs.length}개: ${[...new Set(pxs)].slice(0, 5).join(' ')}`)

  // §3 프리미티브로 조립 — absolute / 일회용 margin
  const abs = (styleBlock.match(/position:\s*absolute/g) ?? []).length
  if (abs) add('§3 프리미티브', 'med', `position:absolute ${abs}곳`)

  const margins = (styleBlock.match(/\bmargin(-(top|bottom|left|right))?:\s*(?!0)(?!auto)/g) ?? []).length
  if (margins > 3) add('§3 프리미티브', 'low', `개별 margin ${margins}곳 — Stack/Cluster의 gap으로 대체 가능한가`)

  // §4 primary 하나
  const buttons = [...template.matchAll(/<Button\b[^>]*>/g)].map((m) => m[0])
  const primary = buttons.filter(
    (b) => !/severity=|outlined|text\b|link\b/.test(b) || /severity="?danger/.test(b) === false && !/severity=/.test(b),
  ).filter((b) => !/severity=/.test(b) && !/\btext\b/.test(b) && !/outlined/.test(b))
  if (primary.length > 1) add('§4 primary 하나', 'high', `주 버튼 ${primary.length}개`)

  // §8 ⑦ 상태 넷
  const hasEmpty = /EzEmptyState|조회 결과가 없습니다|placeholder:\s*'조회/.test(src) || /placeholder/.test(src)
  const hasError = /error|오류|invalid|field__err/.test(src)
  const hasLoading = /loading|로딩|busy|saving/.test(src)
  const missing = [!hasEmpty && '빈', !hasError && '오류', !hasLoading && '로딩'].filter(Boolean)
  if (missing.length) add('§8⑦ 상태 넷', 'high', `미정의: ${missing.join(' · ')}`)

  // §5 숫자 정렬
  const hasNumCol = /hozAlign:\s*'right'|class="num"|\.num\b/.test(src)
  if (hasNumCol && !/tabular-nums/.test(src) && !/ez-grid/.test(src)) {
    add('§5 타이포', 'low', '숫자 열이 있는데 tabular-nums 없음')
  }

  // §2 여백 — 하드코딩된 gap
  const rawGap = [...styleBlock.matchAll(/gap:\s*(\d+px)/g)].map((m) => m[1])
  if (rawGap.length) add('§2 여백 역할', 'med', `gap 리터럴: ${[...new Set(rawGap)].join(' ')}`)

  // 역할 토큰을 쓰는가 (v1.4.0)
  const usesRole = /--ez-gap-(adjacent|intra|inter|block|region)/.test(styleBlock)

  rows.push({ file, hex: hexes.length, px: pxs.length, abs, margins, buttons: buttons.length, usesRole })
}

console.log('화면별 요약')
console.log('file'.padEnd(24), 'hex px  abs margin btn 역할토큰')
for (const r of rows) {
  console.log(
    r.file.padEnd(24),
    String(r.hex).padStart(3),
    String(r.px).padStart(3),
    String(r.abs).padStart(4),
    String(r.margins).padStart(6),
    String(r.buttons).padStart(4),
    r.usesRole ? ' O' : ' X',
  )
}

console.log('\n지적 사항', findings.length, '건')
const bySev = { high: [], med: [], low: [] }
findings.forEach((f) => bySev[f.severity].push(f))
for (const sev of ['high', 'med', 'low']) {
  if (!bySev[sev].length) continue
  console.log(`\n[${sev}] ${bySev[sev].length}건`)
  bySev[sev].forEach((f) => console.log(`  ${f.file.replace('.vue', '').padEnd(20)} ${f.rule.padEnd(16)} ${f.detail}`))
}
