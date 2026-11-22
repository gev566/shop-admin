<script setup lang="ts">
useHead({ title: 'Обзор — Shop Admin' })

// Пока показатели — заглушки. На следующем шаге они будут считаться из данных заказов.
const stats = [
  { label: 'Выручка за месяц', value: formatPrice(0) },
  { label: 'Заказов', value: '0' },
  { label: 'Средний чек', value: formatPrice(0) },
  { label: 'Новых клиентов', value: '0' },
]
</script>

<template>
  <div>
    <PageHeader title="Обзор" subtitle="Главные показатели магазина" />
    <div class="stats">
      <div v-for="stat in stats" :key="stat.label" class="card stat">
        <span class="muted">{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </div>
    </div>
    <ComingSoon :items="['График выручки по дням', 'Последние заказы', 'Товары, которые заканчиваются на складе']" />
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat { display: grid; gap: 6px; }
.stat strong { font-size: 1.5rem; font-variant-numeric: tabular-nums; }
</style>
