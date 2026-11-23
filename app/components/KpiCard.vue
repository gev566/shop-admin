<script setup lang="ts">
import type { Kpi } from '~/utils/analytics'

// Карточка показателя: значение и изменение к прошлому периоду
const props = defineProps<{ label: string; kpi: Kpi; format?: 'price' | 'number' }>()

const value = computed(() => (props.format === 'price' ? formatPrice(props.kpi.value) : props.kpi.value.toLocaleString('ru-RU')))
const trend = computed(() => (props.kpi.change === null ? 'none' : props.kpi.change > 0 ? 'up' : props.kpi.change < 0 ? 'down' : 'flat'))
</script>

<template>
  <div class="card kpi">
    <span class="muted label">{{ label }}</span>
    <strong class="value">{{ value }}</strong>
    <span class="change" :class="`change--${trend}`">
      <template v-if="kpi.change === null">нет данных для сравнения</template>
      <template v-else>
        {{ kpi.change > 0 ? '▲' : kpi.change < 0 ? '▼' : '■' }} {{ Math.abs(kpi.change) }}% к прошлым 30 дням
      </template>
    </span>
  </div>
</template>

<style scoped>
.kpi { display: grid; gap: 6px; }
.label { font-size: 0.9rem; }
.value { font-size: 1.55rem; font-variant-numeric: tabular-nums; line-height: 1.2; }
.change { font-size: 0.82rem; font-weight: 600; }
.change--up { color: var(--success); }
.change--down { color: var(--danger); }
.change--flat, .change--none { color: var(--muted); font-weight: 400; }
</style>
