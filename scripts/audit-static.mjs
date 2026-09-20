import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

  // §4 primary 하나 — **영역당** 하나다. 페이지머리와 조회영역은 다른 영역이고,
  // 모달·패널 푸터도 각자 영역이다. 영역을 안 보면 전부 오탐이 난다(2026-09-20 감사에서 겪었다).
  const buttons = [...template.matchAll(/<Button\b[^>]*>/g)].map((m) => m[0])
  const primary = buttons.filter((b) => !/severity=/.test(b) && !/\btext\b/.test(b) && !/outlined/.test(b))
  // 컴포넌트 진열이 목적인 화면은 예외다
  const isCatalog = /Catalog/.test(file)
  const regionCount = (template.match(/<(Dialog|Drawer)\b/g) ?? []).length
  const pageLevel = primary.length - regionCount
  if (!isCatalog && pageLevel > 2) {
    add('§4 primary 하나', 'high', `영역 밖 주 버튼 ${pageLevel}개 — 영역을 나눴는지 확인`)
  }

  // §8 ⑦ 상태 넷 — **빈 상태는 목록이 있는 화면에만** 요구한다.
  // 로그인·대시보드에 "결과 없음"을 요구하면 그건 규칙이 틀린 것이다.
  const hasList = /TabGrid|QueryState/.test(src)
  const hasEmpty = /QueryState|EzEmptyState|조회 결과가 없습니다/.test(src)
  const hasError = /QueryState|:error|field__err|role="alert"/.test(src)
  const hasLoading = /QueryState|loading\b/.test(src)
  const missing = [hasList && !hasEmpty && '빈', !hasError && '오류', !hasLoading && '로딩'].filter(Boolean)
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

// ---------------------------------------------------------------------------
// 예약 클래스 충돌 — 디자인 시스템의 레이아웃 프리미티브 이름을 앱이 다시 정의하면
// 조용히 망가진다. 2026-09-20에 `.ez-grid`가 그랬다: 앱은 Tabulator 래퍼로 쓰고
// 디자인 시스템은 `display:grid`로 선언해서, v1.4.0으로 올린 순간 헤더가 표 전체를
// 먹고 본문 높이가 0이 됐다. **콘솔 오류는 없었다** — 그래서 눈으로만 잡힌다.
// 예약어 목록은 하드코딩하지 않고 설치된 layout.css에서 읽는다.
// ---------------------------------------------------------------------------
const repo = fileURLToPath(new URL('..', import.meta.url))

function reservedClassConflicts() {
  const layout = join(repo, 'node_modules/@ezwel/ui/dist/layout.css')
  if (!existsSync(layout)) return null
  const reserved = new Set(
    [...readFileSync(layout, 'utf8').matchAll(/^\.(ez-[a-z-]+)\s*\{/gm)].map((m) => m[1]),
  )
  const hits = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'dist') continue
      const f = join(d, e.name)
      if (e.isDirectory()) walk(f)
      else if (/\.(css|vue)$/.test(e.name)) {
        for (const m of readFileSync(f, 'utf8').matchAll(/^\s*\.(ez-[a-z-]+)(?=[\s,{:])/gm)) {
          if (reserved.has(m[1])) hits.push(`${f.replace(repo, '')} 가 .${m[1]} 을(를) 다시 정의한다`)
        }
      }
    }
  }
  walk(join(repo, 'shared'))
  walk(join(repo, 'app/src'))
  return { reserved: reserved.size, hits }
}

const conflict = reservedClassConflicts()
if (!conflict) {
  console.log('\n예약 클래스 검사: @ezwel/ui 미설치 — 건너뜀')
} else if (conflict.hits.length) {
  console.log(`\n[critical] 예약 클래스 충돌 ${conflict.hits.length}건 (예약어 ${conflict.reserved}개 대조)`)
  conflict.hits.forEach((h) => console.log('  ' + h))
  process.exitCode = 1
} else {
  console.log(`\n예약 클래스 검사: 충돌 없음 (예약어 ${conflict.reserved}개 대조)`)
}
