import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createDemoProducts } from '~/data/products'
import type { Product } from '~/types'
import { LOW_STOCK } from '~/utils/table'

const STORAGE_KEY = 'shop-admin:products'

// Читает сохранённый каталог; если его нет или он испорчен — берём демо-данные
function load(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Product[]
    }
  } catch {
    // нет доступа к localStorage или битый JSON
  }
  return createDemoProducts()
}

// Хранилище товаров (Pinia, setup-синтаксис). Каталог сохраняется в localStorage,
// поэтому изменения переживают перезагрузку страницы.
export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>(load())

  watch(
    items,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // без localStorage просто не сохраняем
      }
    },
    { deep: true },
  )

  const categories = computed(() => [...new Set(items.value.map((product) => product.category))].sort())
  const lowStockCount = computed(() => items.value.filter((product) => product.status === 'active' && product.stock < LOW_STOCK).length)

  function byId(id: number): Product | undefined {
    return items.value.find((product) => product.id === id)
  }

  function add(data: Omit<Product, 'id'>): Product {
    const id = Math.max(0, ...items.value.map((product) => product.id)) + 1
    const product = { ...data, id }
    items.value.push(product)
    return product
  }

  function update(id: number, data: Omit<Product, 'id'>): void {
    const index = items.value.findIndex((product) => product.id === id)
    if (index !== -1) items.value[index] = { ...data, id }
  }

  function remove(id: number): void {
    items.value = items.value.filter((product) => product.id !== id)
  }

  // Вернуть исходный демо-каталог — удобно, если всё удалил во время просмотра
  function resetDemo(): void {
    items.value = createDemoProducts()
  }

  return { items, categories, lowStockCount, byId, add, update, remove, resetDemo }
})
