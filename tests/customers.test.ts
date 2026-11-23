import { describe, expect, it } from 'vitest'
import type { Customer, Order } from '../app/types'
import { customerStats, filterCustomers, sortCustomers } from '../app/utils/customers'
import { can } from '../app/utils/permissions'

const customers: Customer[] = [
  { id: 1, name: 'Анна Петросян', email: 'anna@example.com', phone: '+374 91 000001', city: 'Ереван', registeredAt: '2025-01-01' },
  { id: 2, name: 'Борис Иванов', email: 'boris@example.com', phone: '+374 91 000002', city: 'Гюмри', registeredAt: '2025-02-01' },
  { id: 3, name: 'Вера Смирнова', email: 'vera@example.com', phone: '+374 91 000003', city: 'Москва', registeredAt: '2025-03-01' },
]

const order = (id: number, customerId: number, total: number, createdAt: string, status: Order['status'] = 'delivered'): Order => ({
  id,
  number: `A-${id}`,
  customerId,
  createdAt,
  items: [{ productId: 1, name: 'Товар', price: total, qty: 1 }],
  status,
  history: [{ status: 'new', at: createdAt }],
})

const orders = [
  order(1, 1, 1000, '2026-11-01T10:00:00Z'),
  order(2, 1, 4000, '2026-11-10T10:00:00Z'),
  order(3, 2, 9000, '2026-11-05T10:00:00Z', 'cancelled'),
  order(4, 2, 2000, '2026-11-03T10:00:00Z'),
]

describe('customerStats', () => {
  it('считает заказы, сумму без отменённых и дату последнего заказа', () => {
    const rows = customerStats(customers, orders)
    expect(rows[0]!.stats).toEqual({ orders: 2, spent: 5000, lastOrderAt: '2026-11-10T10:00:00Z' })
    expect(rows[1]!.stats).toEqual({ orders: 2, spent: 2000, lastOrderAt: '2026-11-05T10:00:00Z' })
    expect(rows[2]!.stats).toEqual({ orders: 0, spent: 0, lastOrderAt: null })
  })
})

describe('filterCustomers / sortCustomers', () => {
  const rows = customerStats(customers, orders)

  it('ищет по имени, почте, городу и телефону', () => {
    expect(filterCustomers(rows, 'гюмри').map((r) => r.id)).toEqual([2])
    expect(filterCustomers(rows, 'VERA@').map((r) => r.id)).toEqual([3])
  })

  it('сортирует по сумме покупок и по имени', () => {
    expect(sortCustomers(rows, 'spent').map((r) => r.id)).toEqual([1, 2, 3])
    expect(sortCustomers(rows, 'name').map((r) => r.name[0])).toEqual(['А', 'Б', 'В'])
    expect(sortCustomers(rows, 'lastOrderAt').map((r) => r.id)).toEqual([1, 2, 3])
  })
})

describe('права ролей', () => {
  it('администратору можно всё', () => {
    expect(can('admin', 'products.delete')).toBe(true)
    expect(can('admin', 'settings.view')).toBe(true)
  })

  it('менеджер не удаляет товары, не отменяет заказы и не видит настройки', () => {
    expect(can('manager', 'products.edit')).toBe(true)
    expect(can('manager', 'orders.changeStatus')).toBe(true)
    expect(can('manager', 'products.delete')).toBe(false)
    expect(can('manager', 'orders.cancel')).toBe(false)
    expect(can('manager', 'settings.view')).toBe(false)
  })
})
