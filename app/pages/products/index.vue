<script setup lang="ts">
useHead({ title: 'Товары — Shop Admin' })
</script>

<template>
  <div>
    <PageHeader title="Товары" subtitle="Каталог, цены и остатки">
      <button type="button" class="btn btn--primary" disabled>Добавить товар</button>
    </PageHeader>
    <ComingSoon
      :items="[
        'Таблица товаров с сортировкой и постраничным выводом',
        'Поиск и фильтры по категории и статусу',
        'Форма добавления и редактирования с проверкой полей',
      ]"
    />
  </div>
</template>
