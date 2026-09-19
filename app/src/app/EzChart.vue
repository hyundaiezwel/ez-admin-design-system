<script setup lang="ts">
/**
 * ECharts 래퍼.
 *
 * 차트 라이브러리는 CSS 변수를 모른다 — 색·글자색을 JS 옵션으로 받는다. 그래서 화면마다
 * 색을 적어 넣으면 토큰 체계 밖으로 새고, 테마를 바꿔도 차트만 라이트로 남는다.
 * 여기서 `getComputedStyle`로 토큰을 읽어 옵션에 주입하고, 테마가 바뀌면 다시 읽는다.
 *
 * `aria.decal`을 켜 두는 것이 이 래퍼의 두 번째 이유다 — 계열마다 패턴이 입혀져
 * 색 없이도 구분된다(접근성 문서의 "색에만 기대지 않기"가 차트에서 늘 깨지는 지점).
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DatasetComponent, AriaComponent, VisualMapComponent,
} from 'echarts/components'

use([
  CanvasRenderer, BarChart, LineChart, PieChart, HeatmapChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DatasetComponent, AriaComponent, VisualMapComponent,
])

const props = withDefaults(
  defineProps<{
    /** ECharts 옵션. 색·글자색은 넣지 않는다 — 여기서 토큰으로 채운다 */
    option: Record<string, any>
    height?: string
    /** 색 외 단서(패턴). 계열이 2개 이상이면 켜는 것이 기본이다 */
    decal?: boolean
  }>(),
  { height: '260px', decal: true },
)

/** 테마가 바뀌면 값을 다시 읽어야 한다. 카운터를 올려 computed를 무효화한다 */
const themeTick = ref(0)
let observer: MutationObserver | null = null

onMounted(() => {
  observer = new MutationObserver(() => themeTick.value++)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-contrast'] })
})
onUnmounted(() => observer?.disconnect())

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const merged = computed(() => {
  void themeTick.value
  const text = token('--ez-text-default')
  const muted = token('--ez-text-muted')
  const line = token('--ez-border-subtle')
  const surface = token('--ez-surface-default')

  // **기본은 두 색이다.** 계열이 둘이면 브랜드 1색 + 중립색만 쓴다 —
  // 이번 기간 vs 지난 기간 같은 비교 쌍이 업무 차트의 대부분이고, 거기에 여섯 색을
  // 다 꺼내면 알록달록해진다. 셋 이상일 때만 범주 팔레트를 편다.
  //
  // 의미색(success 초록·danger 빨강)은 범주에 쓰지 않는다 — "좋음/나쁨"으로 읽힌다.
  const seriesCount = Array.isArray(props.option.series) ? props.option.series.length : 1
  const pieCount =
    props.option.series?.[0]?.type === 'pie' ? (props.option.series[0].data?.length ?? 0) : 0
  const count = Math.max(seriesCount, pieCount)

  const palette =
    count <= 2
      ? [token('--ez-chart-1'), token('--ez-chart-muted')]
      : [1, 2, 3, 4, 5, 6].map((i) => token(`--ez-chart-${i}`))

  const axis = {
    axisLine: { lineStyle: { color: line } },
    axisTick: { show: false },
    axisLabel: { color: muted, fontSize: 11 },
    splitLine: { lineStyle: { color: line, type: 'dashed' } },
  }

  return {
    color: palette,
    backgroundColor: 'transparent',
    textStyle: { fontFamily: token('--ez-font-family'), color: text },
    // 기본은 꺼져 있다. 켜야 패턴이 입혀진다
    aria: { enabled: props.decal, decal: { show: props.decal } },
    tooltip: {
      backgroundColor: surface,
      borderColor: token('--ez-border-default'),
      textStyle: { color: text, fontSize: 12 },
      ...(props.option.tooltip ?? {}),
    },
    legend: { textStyle: { color: muted, fontSize: 11 }, icon: 'roundRect', ...(props.option.legend ?? {}) },
    grid: { left: 48, right: 16, top: 28, bottom: 28, ...(props.option.grid ?? {}) },
    ...props.option,
    xAxis: props.option.xAxis ? { ...axis, ...props.option.xAxis } : undefined,
    yAxis: props.option.yAxis ? { ...axis, ...props.option.yAxis } : undefined,
  }
})
</script>

<template>
  <!-- KeepAlive 안에서 autoresize가 즉시 발화하면 ECharts가
       "resize should not be called during main process" 경고를 낸다. 스로틀로 한 틱 미룬다 -->
  <VChart class="chart" :option="merged" :style="{ height }" :autoresize="{ throttle: 100 }" />
</template>

<style scoped>
.chart { width: 100%; }
</style>
