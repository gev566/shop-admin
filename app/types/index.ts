// Основные сущности магазина

export type ProductStatus = 'active' | 'draft' | 'archived'

export interface Product {
  id: number
  name: string
  sku: string // артикул
  price: number // в драмах, целое число
  stock: number // остаток на складе
  category: string
  status: ProductStatus
}

export type OrderStatus = 'new' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

// Позиция заказа. Название и цена копируются в момент покупки:
// если товар потом переименуют или подорожает, старый заказ не изменится.
export interface OrderItem {
  productId: number
  name: string
  price: number
  qty: number
}

export interface StatusChange {
  status: OrderStatus
  at: string // ISO-дата и время
}

export interface Order {
  id: number
  number: string // номер для людей: «A-10023»
  customerId: number
  createdAt: string // ISO-дата и время
  items: OrderItem[]
  status: OrderStatus
  history: StatusChange[] // все смены статуса, первая — создание заказа
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  city: string
  registeredAt: string // ISO-дата
}

export interface NavItem {
  to: string
  label: string
  icon: string
}
