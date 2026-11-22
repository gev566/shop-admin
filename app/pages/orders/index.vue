<script setup lang="ts">
useHead({ title: 'Заказы — Shop Admin' })
</script>

<template>
  <div>
    <PageHeader title="Заказы" subtitle="Все заказы и их статусы" />
    <ComingSoon :items="['Список заказов с фильтром по статусу и дате', 'Карточка заказа с составом и историей', 'Смена статуса: оплачен, отправлен, доставлен']" />
  </div>
</template>
