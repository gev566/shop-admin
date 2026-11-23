import type { Customer, Order } from '~/types'
import { orderTotal } from '~/utils/orders'

export interface CustomerStats {
  orders: number // все заказы, включая отменённые
  spent: number // сумма без отменённых
  lastOrderAt: string | null
}

export interface CustomerRow extends Customer {
  stats: CustomerStats
}

// Считает статистику для всех клиентов за один проход по заказам
export function customerStats(customers: Customer[], orders: Order[]): CustomerRow[] {
  const map = new Map<number, CustomerStats>(customers.map((c) => [c.id, { orders: 0, spent: 0, lastOrderAt: null }]))
  for (const order of orders) {
    const stats = map.get(order.customerId)
    if (!stats) continue
    stats.orders += 1
    if (order.status !== 'cancelled') stats.spent += orderTotal(order.items)
    if (!stats.lastOrderAt || order.createdAt > stats.lastOrderAt) stats.lastOrderAt = order.createdAt
  }
  return customers.map((customer) => ({ ...customer, stats: map.get(customer.id)! }))
}

export type CustomerSort = 'spent' | 'orders' | 'name' | 'lastOrderAt'

export function filterCustomers(rows: CustomerRow[], query: string): CustomerRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => [row.name, row.email, row.city, row.phone].some((value) => value.toLowerCase().includes(q)))
}

export function sortCustomers(rows: CustomerRow[], key: CustomerSort): CustomerRow[] {
  const collator = new Intl.Collator('ru')
  return [...rows].sort((a, b) => {
    if (key === 'name') return collator.compare(a.name, b.name)
    if (key === 'lastOrderAt') return (b.stats.lastOrderAt ?? '').localeCompare(a.stats.lastOrderAt ?? '')
    return b.stats[key] - a.stats[key] || a.id - b.id // по убыванию: самые ценные клиенты сверху
  })
}
