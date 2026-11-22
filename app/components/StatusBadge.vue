<script setup lang="ts">
import type { ProductStatus } from '~/types'

const props = defineProps<{ status: ProductStatus }>()

const LABELS: Record<ProductStatus, string> = { active: 'В продаже', draft: 'Черновик', archived: 'В архиве' }
const label = computed(() => LABELS[props.status])
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ label }}</span>
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
.badge--active { color: var(--success); }
.badge--draft { color: var(--warning); }
.badge--archived { color: var(--muted); }
</style>
