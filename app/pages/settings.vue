<script setup lang="ts">
useHead({ title: 'Настройки — Shop Admin' })
</script>

<template>
  <div>
    <PageHeader title="Настройки" subtitle="Параметры магазина и интерфейса" />
    <ComingSoon :items="['Название магазина и валюта', 'Роли пользователей: администратор и менеджер']" />
  </div>
</template>
