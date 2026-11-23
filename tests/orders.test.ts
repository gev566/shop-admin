import { describe, expect, it } from 'vitest'
import { createDemoCustomers } from '../app/data/customers'
import { createDemoOrders } from '../app/data/orders'
import { createDemoProducts } from '../app/data/products'
import type { Order } from '../app/types'
import { canTransition, countByStatus, filterOrders, nextStatuses, orderTotal, withStatus } from '../app/utils/orders'

const today = new Date(2026, 10, 23, 12, 0)
const products = createDemoProducts()
const customers = createDemoCustomers(today)
const orders = createDemoOrders(products, customers, today)
const byId = new Map(customers.map((c) => [c.id, c]))

describe('переходы статусов', () => {
  it('разрешает только допустимые шаги', () => {
    expect(nextStatuses('new')).toEqual(['paid', 'cancelled'])
    expect(canTransition('paid', 'shipped')).toBe(true)
    expect(canTransition('shipped', 'cancelled')).toBe(false) // отправленный уже не отменить
    expect(canTransition('delivered', 'new')).toBe(false)
    expect(nextStatuses('cancelled')).toEqual([])
  })

  it('withStatus пишет историю и не трогает исходный заказ', () => {
    const order = orders.find((o) => o.status === 'new')!
    const changed = withStatus(order, 'paid', new Date(2026, 10, 23, 15, 0))
    expect(changed.status).toBe('paid')
    expect(changed.history.at(-1)?.status).toBe('paid')
    expect(changed.history).toHaveLength(order.history.length + 1)
    expect(order.status).toBe('new')
  })

  it('withStatus бросает ошибку на запрещённый переход', () => {
    const order = orders.find((o) => o.status === 'delivered')!
    expect(() => withStatus(order, 'new', today)).toThrow(/Нельзя/)
  })
})

describe('orderTotal', () => {
  it('складывает цену × количество', () => {
    expect(orderTotal([{ productId: 1, name: 'a', price: 1000, qty: 2 }, { productId: 2, name: 'b', price: 500, qty: 1 }])).toBe(2500)
  })
})

describe('filterOrders', () => {
  it('ищет по номеру и имени клиента, фильтрует по статусу', () => {
    const sample: Order[] = [
      { ...orders[0]!, id: 1, number: 'A-1', customerId: 1, status: 'new' },
      { ...orders[0]!, id: 2, number: 'A-2', customerId: 2, status: 'paid' },
    ]
    expect(filterOrders(sample, byId, { query: 'a-2', status: '' }).map((o) => o.id)).toEqual([2])
    expect(filterOrders(sample, byId, { query: 'анна', status: '' }).map((o) => o.id)).toEqual([1])
    expect(filterOrders(sample, byId, { query: '', status: 'paid' }).map((o) => o.id)).toEqual([2])
  })
})

describe('демо-заказы', () => {
  it('одинаковые при каждом запуске и согласованные', () => {
    expect(createDemoOrders(products, customers, today)).toEqual(orders)
    for (const order of orders) {
      expect(order.items.length).toBeGreaterThan(0)
      expect(order.history[0]?.status).toBe('new')
      expect(order.history.at(-1)?.status).toBe(order.status)
      expect(byId.has(order.customerId)).toBe(true)
    }
    const counts = countByStatus(orders)
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(orders.length)
    expect(counts.delivered).toBeGreaterThan(0)
    expect(counts.new).toBeGreaterThan(0)
  })
})
