<script setup lang="ts">
import type { NavItem } from '~/types'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const items: NavItem[] = [
  { to: '/', label: 'Обзор', icon: '◧' },
  { to: '/products', label: 'Товары', icon: '▦' },
  { to: '/orders', label: 'Заказы', icon: '◫' },
  { to: '/customers', label: 'Клиенты', icon: '◉' },
  { to: '/settings', label: 'Настройки', icon: '⚙' },
]
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': open }">
    <div class="brand">
      <span class="logo" aria-hidden="true">S</span>
      <span>Shop Admin</span>
    </div>
    <nav aria-label="Основное меню">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to" class="nav-link" @click="emit('close')">
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar);
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 20;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; padding: 0 8px; }
.logo {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent);
  color: var(--accent-text);
}
nav { display: grid; gap: 2px; }
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
}
.nav-link:hover { background: var(--surface-2); }
/* exact-active: «Обзор» (/) не подсвечивается на других страницах */
.nav-link.router-link-exact-active,
.nav-link.router-link-active:not([href$='/']) { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
.nav-icon { width: 18px; text-align: center; }

@media (max-width: 860px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.2s; }
  .sidebar--open { transform: none; box-shadow: 0 0 40px rgba(0, 0, 0, 0.25); }
}
</style>
