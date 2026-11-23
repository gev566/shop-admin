<script setup lang="ts">
import type { Theme } from '~/composables/useTheme'
import { ROLE_LABELS, type Role } from '~/utils/permissions'

const emit = defineEmits<{ menu: [] }>()
const { theme, apply } = useTheme()
const session = useSessionStore()
const route = useRoute()

// Демо-вход: переключение роли без пароля. Если у новой роли нет доступа к текущей странице — уходим на обзор.
function switchRole(role: Role) {
  session.role = role
  useToast().show(`Вы вошли как ${ROLE_LABELS[role].toLowerCase()}`)
  if (route.meta.permission && !session.can(route.meta.permission)) navigateTo('/')
}

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
    <label class="user" title="Демо-режим: роль переключается без пароля">
      <span class="avatar" aria-hidden="true">{{ ROLE_LABELS[session.role][0] }}</span>
      <span class="visually-hidden">Роль</span>
      <select :value="session.role" @change="switchRole(($event.target as HTMLSelectElement).value as Role)">
        <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
    </label>
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
  .header select { min-width: 0; max-width: 140px; }
}
@media (max-width: 480px) {
  .header { gap: 8px; }
  .avatar { display: none; }
  .header select { max-width: 120px; padding-left: 8px; padding-right: 4px; }
}
</style>
