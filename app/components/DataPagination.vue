<script setup lang="ts">
// Переключатель страниц: «назад», номера страниц, «вперёд».
// Длинный список номеров сокращается многоточием: 1 … 4 5 6 … 12
const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const pages = computed<(number | '…')[]>(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages)
  const result: (number | '…')[] = [1]
  if (around[0]! > 2) result.push('…')
  result.push(...around)
  if (around[around.length - 1]! < totalPages - 1) result.push('…')
  result.push(totalPages)
  return result
})
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Страницы">
    <button type="button" class="btn" :disabled="page <= 1" @click="emit('change', page - 1)">←</button>
    <template v-for="(item, i) in pages" :key="i">
      <span v-if="item === '…'" class="muted gap">…</span>
      <button
        v-else
        type="button"
        class="btn"
        :class="{ 'btn--current': item === page }"
        :aria-current="item === page ? 'page' : undefined"
        @click="emit('change', item)"
      >
        {{ item }}
      </button>
    </template>
    <button type="button" class="btn" :disabled="page >= totalPages" @click="emit('change', page + 1)">→</button>
  </nav>
</template>

<style scoped>
.pagination { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.btn { min-width: 36px; padding: 6px 10px; font-variant-numeric: tabular-nums; }
.btn--current { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.gap { padding: 0 4px; }
</style>
