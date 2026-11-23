import { describe, expect, it } from 'vitest'
import type { Order, OrderStatus } from '../app/types'
import { dayKey, revenueByDay, summary, topProducts } from '../app/utils/analytics'

const today = new Date(2026, 10, 23, 15, 0)

let nextId = 1
function order(daysAgo: number, total: number, status: OrderStatus = 'delivered', customerId = 1, productId = 1): Order {
  const created = new Date(2026, 10, 23 - daysAgo, 12, 0)
  return {
    id: nextId++,
    number: `A-${nextId}`,
    customerId,
    createdAt: created.toISOString(),
    items: [{ productId, name: `Товар ${productId}`, price: total, qty: 1 }],
    status,
    history: [{ status: 'new', at: created.toISOString() }],
  }
}

describe('revenueByDay', () => {
  it('раскладывает выручку по дням и не учитывает отменённые', () => {
    const days = revenueByDay([order(0, 1000), order(0, 500), order(2, 700), order(1, 999, 'cancelled'), order(40, 5000)], today, 3)
    expect(days).toEqual([
      { day: '2026-11-21', revenue: 700, orders: 1 },
      { day: '2026-11-22', revenue: 0, orders: 0 },
      { day: '2026-11-23', revenue: 1500, orders: 2 },
    ])
  })

  it('dayKey берёт местную дату', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('summary', () => {
  it('сравнивает последние 30 дней с предыдущими 30', () => {
    const list = [
      order(1, 3000, 'delivered', 1),
      order(5, 1000, 'paid', 2),
      order(10, 2000, 'cancelled', 3), // не считается
      order(35, 2000, 'delivered', 1),
      order(50, 2000, 'delivered', 4),
    ]
    const s = summary(list, today)
    expect(s.revenue).toEqual({ value: 4000, previous: 4000, change: 0 })
    expect(s.orders).toEqual({ value: 2, previous: 2, change: 0 })
    expect(s.averageCheck.value).toBe(2000)
    expect(s.customers.value).toBe(2)
  })

  it('возвращает null вместо процента, если сравнивать не с чем', () => {
    expect(summary([order(1, 1000)], today).revenue.change).toBeNull()
  })
})

describe('topProducts', () => {
  it('сортирует товары по выручке', () => {
    const top = topProducts([order(1, 1000, 'delivered', 1, 7), order(2, 3000, 'delivered', 1, 8), order(3, 1500, 'delivered', 1, 7)])
    expect(top.map((t) => [t.productId, t.revenue, t.qty])).toEqual([
      [8, 3000, 1],
      [7, 2500, 2],
    ])
  })
})
