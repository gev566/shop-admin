<script setup lang="ts">
// Заглушка для разделов, которые появятся на следующих шагах
defineProps<{ items: string[] }>()
</script>

<template>
  <section class="card soon">
    <h2>Раздел в разработке</h2>
    <p class="muted">Что здесь появится:</p>
    <ul>
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>

<style scoped>
.soon ul { margin: 8px 0 0; padding-left: 20px; }
.soon li { margin: 4px 0; }
</style>
