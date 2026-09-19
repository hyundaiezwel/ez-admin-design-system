<script setup lang="ts">
/** 로그인 전용 레이아웃. 셸(헤더·LNB·탭)이 없다 — 인증 전에는 갈 곳이 없다 */
</script>

<template>
  <div class="auth">
    <RouterView />
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: var(--ez-space-6);
  background: var(--ez-surface-canvas);
}
</style>
