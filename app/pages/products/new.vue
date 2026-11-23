<script setup lang="ts">
import { draftToProduct, type ProductDraft } from '~/utils/validation'

useHead({ title: 'Новый товар — Shop Admin' })

const store = useProductsStore()
const { show } = useToast()

function save(draft: ProductDraft) {
  const product = store.add(draftToProduct(draft))
  show(`Товар «${product.name}» добавлен`)
  navigateTo('/products')
}
</script>

<template>
  <div>
    <PageHeader title="Новый товар" subtitle="Заполните поля — ошибки подсветятся сразу" />
    <ProductForm :existing="store.items" :categories="store.categories" @submit="save" />
  </div>
</template>
