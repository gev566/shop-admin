import type { Order } from '~/types'
import { orderTotal } from '~/utils/orders'

// Расчёты для страницы «Обзор». Отменённые заказы в выручку не входят.

const DAY = 24 * 60 * 60 * 1000

// Ключ дня по местному времени: «2026-11-23»
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const counted = (orders: Order[]) => orders.filter((order) => order.status !== 'cancelled')

// Заказы за период [from, to) по дате создания
export function ordersBetween(orders: Order[], from: Date, to: Date): Order[] {
  return orders.filter((order) => {
    const t = new Date(order.createdAt).getTime()
    return t >= from.getTime() && t < to.getTime()
  })
}

export interface DayRevenue {
  day: string // ГГГГ-ММ-ДД
  revenue: number
  orders: number
}

// Выручка по дням за последние `days` дней, включая сегодня. Пустые дни — с нулём.
export function revenueByDay(orders: Order[], today: Date, days = 30): DayRevenue[] {
  const end = startOfDay(today)
  const result: DayRevenue[] = []
  const index = new Map<string, number>()
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = dayKey(new Date(end.getTime() - i * DAY))
    index.set(day, result.length)
    result.push({ day, revenue: 0, orders: 0 })
  }
  for (const order of counted(orders)) {
    const i = index.get(dayKey(new Date(order.createdAt)))
    if (i === undefined) continue
    result[i]!.revenue += orderTotal(order.items)
    result[i]!.orders += 1
  }
  return result
}

export interface Kpi {
  value: number
  previous: number
  change: number | null // изменение в процентах к прошлому периоду; null — сравнивать не с чем
}

function kpi(value: number, previous: number): Kpi {
  return { value, previous, change: previous === 0 ? null : Math.round(((value - previous) / previous) * 100) }
}

export interface Summary {
  revenue: Kpi
  orders: Kpi
  averageCheck: Kpi
  customers: Kpi // сколько разных покупателей сделали заказ
}

// Показатели за последние `days` дней в сравнении с предыдущими `days` днями
export function summary(orders: Order[], today: Date, days = 30): Summary {
  const end = new Date(startOfDay(today).getTime() + DAY) // конец сегодняшнего дня
  const start = new Date(end.getTime() - days * DAY)
  const prevStart = new Date(start.getTime() - days * DAY)

  const calc = (list: Order[]) => {
    const valid = counted(list)
    const revenue = valid.reduce((sum, order) => sum + orderTotal(order.items), 0)
    return {
      revenue,
      orders: valid.length,
      averageCheck: valid.length ? Math.round(revenue / valid.length) : 0,
      customers: new Set(valid.map((order) => order.customerId)).size,
    }
  }

  const now = calc(ordersBetween(orders, start, end))
  const before = calc(ordersBetween(orders, prevStart, start))
  return {
    revenue: kpi(now.revenue, before.revenue),
    orders: kpi(now.orders, before.orders),
    averageCheck: kpi(now.averageCheck, before.averageCheck),
    customers: kpi(now.customers, before.customers),
  }
}

export interface TopProduct {
  productId: number
  name: string
  qty: number
  revenue: number
}

// Самые продаваемые товары по выручке за период
export function topProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<number, TopProduct>()
  for (const order of counted(orders)) {
    for (const item of order.items) {
      const row = map.get(item.productId) ?? { productId: item.productId, name: item.name, qty: 0, revenue: 0 }
      row.qty += item.qty
      row.revenue += item.price * item.qty
      map.set(item.productId, row)
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}
