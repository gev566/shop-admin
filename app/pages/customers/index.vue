<script setup lang="ts">
useHead({ title: 'Клиенты — Shop Admin' })
</script>

<template>
  <div>
    <PageHeader title="Клиенты" subtitle="Покупатели магазина" />
    <ComingSoon :items="['Список клиентов с поиском', 'Профиль клиента и его заказы']" />
  </div>
</template>
