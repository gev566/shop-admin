<script setup lang="ts">
import type { DayRevenue } from '~/utils/analytics'

// Столбчатый график выручки по дням на чистом SVG — без библиотек.
// viewBox задаёт «внутренние» координаты, а ширина подстраивается под контейнер.
const props = defineProps<{ data: DayRevenue[] }>()

const W = 720
const H = 220
const PAD = { top: 12, right: 8, bottom: 26, left: 56 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

// «Красивый» максимум оси: 137 000 → 150 000, чтобы подписи были круглыми
function niceMax(value: number): number {
  if (value <= 0) return 1
  const step = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / step) * step
}

const max = computed(() => niceMax(Math.max(...props.data.map((d) => d.revenue))))
const barW = computed(() => innerW / props.data.length)
const ticks = computed(() => [0, 0.5, 1].map((k) => Math.round(max.value * k)))

const y = (value: number) => PAD.top + innerH - (value / max.value) * innerH
const short = (value: number) => (value >= 1_000_000 ? `${+(value / 1_000_000).toFixed(1)} млн` : value >= 1000 ? `${Math.round(value / 1000)} тыс` : String(value))
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

const hovered = ref<number | null>(null)
const active = computed(() => (hovered.value === null ? null : props.data[hovered.value]))
</script>

<template>
  <div class="chart">
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Выручка по дням за ${data.length} дней`" @mouseleave="hovered = null">
      <g v-for="tick in ticks" :key="tick">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(tick)" :y2="y(tick)" class="grid" />
        <text :x="PAD.left - 8" :y="y(tick) + 4" text-anchor="end" class="axis">{{ short(tick) }}</text>
      </g>
      <g v-for="(d, i) in data" :key="d.day">
        <!-- прозрачная полоса во всю высоту — чтобы подсказка ловилась даже над пустым днём -->
        <rect :x="PAD.left + i * barW" :y="PAD.top" :width="barW" :height="innerH" class="hit" @mouseenter="hovered = i" />
        <rect
          :x="PAD.left + i * barW + barW * 0.15"
          :y="y(d.revenue)"
          :width="barW * 0.7"
          :height="Math.max(0, PAD.top + innerH - y(d.revenue))"
          rx="3"
          class="bar"
          :class="{ 'bar--active': hovered === i }"
        />
        <text
          v-if="(i % 5 === 0 && i < data.length - 3) || i === data.length - 1"
          :x="i === data.length - 1 ? W - PAD.right : PAD.left + i * barW + barW / 2"
          :y="H - 8"
          :text-anchor="i === data.length - 1 ? 'end' : 'middle'"
          class="axis"
        >
          {{ dayLabel(d.day) }}
        </text>
      </g>
    </svg>
    <p class="tooltip" aria-live="polite">
      <template v-if="active">
        <strong>{{ dayLabel(active.day) }}</strong> · {{ formatPrice(active.revenue) }} ·
        {{ active.orders }} {{ plural(active.orders, ['заказ', 'заказа', 'заказов']) }}
      </template>
      <span v-else class="muted">Наведите на столбец, чтобы увидеть детали дня</span>
    </p>
  </div>
</template>

<style scoped>
svg { width: 100%; height: auto; display: block; }
.grid { stroke: var(--border); stroke-width: 1; }
.axis { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.hit { fill: transparent; }
.bar { fill: var(--accent); opacity: 0.85; transition: opacity 0.15s; pointer-events: none; }
.bar--active { opacity: 1; fill: var(--accent); }
.tooltip { margin: 8px 0 0; font-size: 0.9rem; min-height: 1.4em; font-variant-numeric: tabular-nums; }
</style>
