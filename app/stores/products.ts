import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createDemoProducts } from '~/data/products'
import type { Product } from '~/types'
import { LOW_STOCK } from '~/utils/table'

// Хранилище товаров (Pinia, setup-синтаксис). Пока данные — демо-каталог в памяти;
// на следующих шагах здесь появятся добавление, редактирование и сохранение.
export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>(createDemoProducts())

  const categories = computed(() => [...new Set(items.value.map((product) => product.category))].sort())
  const lowStockCount = computed(() => items.value.filter((product) => product.status === 'active' && product.stock < LOW_STOCK).length)

  function byId(id: number): Product | undefined {
    return items.value.find((product) => product.id === id)
  }

  return { items, categories, lowStockCount, byId }
})
