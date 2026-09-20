<script setup lang="ts">
/**
 * 조회 상태 넷을 한 자리에서 그린다 — 로딩 · 오류 · 빈 · 정상.
 *
 * 원칙 §8⑦의 "상태 넷을 만든다"를 화면마다 다시 쓰지 않기 위한 틀이다.
 * 화면은 `loading`/`error`/`empty`만 넘기고 내용은 기본 슬롯에 둔다.
 *
 * 로딩을 오버레이가 아니라 **자리를 차지하는 스켈레톤**으로 그리는 이유 —
 * 오버레이는 조회 조건을 가려서 "무엇으로 조회했는지"를 못 보게 한다.
 */
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    empty?: boolean
    /** 스켈레톤 줄 수. 그 자리에 올 내용 높이와 비슷하게 맞춘다 */
    lines?: number
    emptyText?: string
  }>(),
  { lines: 6, emptyText: '조회 결과가 없습니다.' },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <!-- 오류가 로딩보다 앞이다. 실패한 조회의 스켈레톤은 거짓말이다 -->
  <Message v-if="error" severity="error" :closable="false" class="qs__error">
    <div class="qs__error-body">
      <span>{{ error }}</span>
      <Button label="다시 시도" size="small" severity="secondary" outlined @click="$emit('retry')" />
    </div>
  </Message>

  <div v-else-if="loading" class="qs__skeleton" role="status" aria-live="polite" aria-busy="true">
    <span class="ez-sr-only">조회 중입니다</span>
    <Skeleton v-for="n in lines" :key="n" height="2rem" class="qs__line" />
  </div>

  <div v-else-if="empty" class="qs__empty" role="status">
    <p class="qs__empty-text">{{ emptyText }}</p>
    <p class="qs__empty-hint">조회 조건을 바꿔 다시 시도해 보세요.</p>
  </div>

  <slot v-else />
</template>

<style scoped>
.qs__error { margin: 0; }
.qs__error-body {
  display: flex;
  align-items: center;
  gap: var(--ez-gap-inter);
  flex-wrap: wrap;
}

.qs__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--ez-gap-intra);
  padding: var(--ez-gap-block);
  background: var(--ez-surface-default);
  border: var(--ez-card-border-width) solid var(--ez-border-default);
  border-radius: var(--ez-card-radius);
}

.qs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ez-gap-intra);
  padding: var(--ez-space-12) var(--ez-gap-block);
  background: var(--ez-surface-default);
  border: var(--ez-card-border-width) solid var(--ez-border-default);
  border-radius: var(--ez-card-radius);
  text-align: center;
}

.qs__empty-text { margin: 0; font-size: var(--ez-font-size-sm); color: var(--ez-text-muted); }
.qs__empty-hint { margin: 0; font-size: var(--ez-font-size-2xs); color: var(--ez-text-muted); }
</style>
