<script setup lang="ts">
import type { Theme } from '~/composables/useTheme'

const emit = defineEmits<{ menu: [] }>()
const { theme, apply } = useTheme()

const options: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]
</script>

<template>
  <header class="header">
    <button type="button" class="btn menu-btn" aria-label="Открыть меню" @click="emit('menu')">☰</button>
    <div class="spacer" />
    <label>
      <span class="visually-hidden">Тема</span>
      <select :value="theme" @change="apply(($event.target as HTMLSelectElement).value as Theme)">
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </label>
    <div class="user" title="Демо-пользователь">
      <span class="avatar" aria-hidden="true">А</span>
      <span class="user-name">Администратор</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  padding: 0 24px;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.spacer { flex: 1; }
.menu-btn { display: none; }
.user { display: flex; align-items: center; gap: 8px; }
.avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
@media (max-width: 860px) {
  .menu-btn { display: inline-block; }
  .header { padding: 0 16px; }
  .user-name { display: none; }
}
</style>
