import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createDemoCustomers } from '~/data/customers'
import { createDemoOrders } from '~/data/orders'
import type { Customer, Order, OrderStatus } from '~/types'
import { withStatus } from '~/utils/orders'
import { useProductsStore } from './products'

const STORAGE_KEY = 'shop-admin:orders'

function loadOrders(): Order[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? (parsed as Order[]) : null
  } catch {
    return null
  }
}

// Заказы и клиенты. Клиенты пока только читаются — свой раздел у них появится позже.
export const useOrdersStore = defineStore('orders', () => {
  const today = new Date()
  const customers = ref<Customer[]>(createDemoCustomers(today))
  const items = ref<Order[]>(loadOrders() ?? createDemoOrders(useProductsStore().items, customers.value, today))

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

  // Map по id — чтобы быстро находить клиента для каждой строки таблицы
  const customersById = computed(() => new Map(customers.value.map((customer) => [customer.id, customer])))

  // Новые заказы сверху
  const sorted = computed(() => [...items.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))

  function byId(id: number): Order | undefined {
    return items.value.find((order) => order.id === id)
  }

  function changeStatus(id: number, status: OrderStatus): void {
    const index = items.value.findIndex((order) => order.id === id)
    if (index !== -1) items.value[index] = withStatus(items.value[index]!, status, new Date())
  }

  function resetDemo(): void {
    items.value = createDemoOrders(useProductsStore().items, customers.value, new Date())
  }

  return { items, customers, customersById, sorted, byId, changeStatus, resetDemo }
})
