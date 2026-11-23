import type { Customer, Order, OrderItem, OrderStatus } from '~/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

// Какие переходы разрешены. Доставленный и отменённый заказы — конечные: из них никуда.
// Отменить можно только до отправки.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status]
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function orderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export interface OrderFilters {
  query: string // номер заказа или имя клиента
  status: OrderStatus | ''
}

export function filterOrders(orders: Order[], customers: Map<number, Customer>, filters: OrderFilters): Order[] {
  const query = filters.query.trim().toLowerCase()
  return orders.filter((order) => {
    if (filters.status && order.status !== filters.status) return false
    if (!query) return true
    const customer = customers.get(order.customerId)
    return order.number.toLowerCase().includes(query) || Boolean(customer?.name.toLowerCase().includes(query))
  })
}

// Сколько заказов в каждом статусе — для счётчиков на вкладках
export function countByStatus(orders: Order[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>
  for (const order of orders) counts[order.status] += 1
  return counts
}

// Меняет статус с проверкой перехода и записью в историю. Возвращает новый объект заказа.
export function withStatus(order: Order, to: OrderStatus, at: Date): Order {
  if (!canTransition(order.status, to)) {
    throw new Error(`Нельзя перевести заказ из «${ORDER_STATUS_LABELS[order.status]}» в «${ORDER_STATUS_LABELS[to]}»`)
  }
  return { ...order, status: to, history: [...order.history, { status: to, at: at.toISOString() }] }
}
