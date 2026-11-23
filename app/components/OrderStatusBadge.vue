<script setup lang="ts">
import type { OrderStatus } from '~/types'
import { ORDER_STATUS_LABELS } from '~/utils/orders'

defineProps<{ status: OrderStatus }>()
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ ORDER_STATUS_LABELS[status] }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid currentColor;
}
.badge--new { color: var(--accent); }
.badge--paid { color: var(--warning); }
.badge--shipped { color: #2f80c4; }
.badge--delivered { color: var(--success); }
.badge--cancelled { color: var(--muted); }
</style>
