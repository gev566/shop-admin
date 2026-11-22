<script setup lang="ts">
// Заголовок страницы: название, подпись и место под кнопки справа
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="muted subtitle">{{ subtitle }}</p>
    </div>
    <div class="actions"><slot /></div>
  </div>
</template>

<style scoped>
.page-header { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; }
.subtitle { margin: 4px 0 0; }
.actions { display: flex; gap: 8px; }
</style>
