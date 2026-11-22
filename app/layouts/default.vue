<script setup lang="ts">
// Общий макет: боковое меню слева, шапка сверху, содержимое страницы справа
const menuOpen = ref(false)
const { restore } = useTheme()
onMounted(restore)
</script>

<template>
  <div class="layout">
    <AppSidebar :open="menuOpen" @close="menuOpen = false" />
    <div v-if="menuOpen" class="backdrop" @click="menuOpen = false" />
    <div class="main">
      <AppHeader @menu="menuOpen = true" />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main { margin-left: var(--sidebar); min-height: 100vh; }
.content { padding: 24px; max-width: 1200px; }
.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); z-index: 15; }
@media (max-width: 860px) {
  .main { margin-left: 0; }
  .content { padding: 16px; }
}
</style>
