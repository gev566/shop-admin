import type { Customer, Order, OrderItem, OrderStatus, Product, StatusChange } from '~/types'
import { seeded } from '~/data/random'

// Демо-заказы за последние 60 дней. Даты считаются от «сегодня», чтобы графики
// на обзоре всегда были свежими, а случайность детерминированная — данные одинаковые при каждом запуске.

// Через какие статусы прошёл заказ, чтобы оказаться в конечном
const PATH: Record<OrderStatus, OrderStatus[]> = {
  new: ['new'],
  paid: ['new', 'paid'],
  shipped: ['new', 'paid', 'shipped'],
  delivered: ['new', 'paid', 'shipped', 'delivered'],
  cancelled: ['new', 'cancelled'],
}

export function createDemoOrders(products: Product[], customers: Customer[], today: Date, count = 90): Order[] {
  const random = seeded(7)
  const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)]!
  const sellable = products.filter((product) => product.status !== 'draft')
  const orders: Order[] = []

  for (let i = 0; i < count; i += 1) {
    // равномерно по 60 дням, свежие заказы чаще остаются «новыми» и «оплаченными»
    const daysAgo = Math.floor((i / count) * 60)
    const created = new Date(today)
    created.setDate(created.getDate() - (59 - daysAgo))
    created.setHours(9 + Math.floor(random() * 12), Math.floor(random() * 60), 0, 0)

    const age = 59 - daysAgo
    const r = random()
    let status: OrderStatus
    if (r < 0.08) status = 'cancelled'
    else if (age <= 1) status = r < 0.6 ? 'new' : 'paid'
    else if (age <= 4) status = r < 0.5 ? 'paid' : 'shipped'
    else status = r < 0.15 ? 'shipped' : 'delivered'

    const items: OrderItem[] = []
    const lines = 1 + Math.floor(random() * 3)
    for (let line = 0; line < lines; line += 1) {
      const product = pick(sellable)
      if (items.some((item) => item.productId === product.id)) continue
      items.push({ productId: product.id, name: product.name, price: product.price, qty: 1 + Math.floor(random() * 2) })
    }

    // история: каждая следующая смена статуса — через несколько часов после предыдущей
    const history: StatusChange[] = PATH[status].map((step, index) => {
      const at = new Date(created)
      at.setHours(at.getHours() + index * (6 + Math.floor(random() * 20)))
      return { status: step, at: at.toISOString() }
    })

    orders.push({
      id: i + 1,
      number: `A-${10001 + i}`,
      customerId: pick(customers).id,
      createdAt: created.toISOString(),
      items,
      status,
      history,
    })
  }
  return orders
}
