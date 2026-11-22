<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode === 404 ? 'Страница не найдена' : 'Что-то пошло не так' }}</h1>
    <button type="button" class="btn btn--primary" @click="clearError({ redirect: '/' })">На главную</button>
  </div>
</template>

<style scoped>
.error-page { min-height: 100vh; display: grid; place-content: center; gap: 16px; text-align: center; }
</style>
