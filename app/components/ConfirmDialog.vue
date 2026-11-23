<script setup lang="ts">
// Окно подтверждения на основе встроенного элемента <dialog>:
// браузер сам держит фокус внутри окна и закрывает его по Esc.
const props = defineProps<{ open: boolean; title: string; text: string; confirmLabel?: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (open) dialog.value?.showModal()
    else dialog.value?.close()
  },
)
</script>

<template>
  <dialog ref="dialog" class="dialog" @cancel.prevent="emit('cancel')">
    <h2>{{ title }}</h2>
    <p class="muted">{{ text }}</p>
    <div class="actions">
      <button type="button" class="btn" @click="emit('cancel')">Отмена</button>
      <button type="button" class="btn btn--danger" @click="emit('confirm')">{{ confirmLabel ?? 'Удалить' }}</button>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  padding: 22px;
  width: min(420px, calc(100vw - 32px));
}
.dialog::backdrop { background: rgba(0, 0, 0, 0.45); }
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
.btn--danger { background: var(--danger); border-color: var(--danger); color: #fff; font-weight: 600; }
</style>
