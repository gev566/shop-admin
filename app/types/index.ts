// Основные сущности магазина. Пока используются только в типах и форматтерах,
// данные появятся на следующих шагах.

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

export interface Order {
  id: number
  customerId: number
  createdAt: string // ISO-дата
  total: number
  status: OrderStatus
}

export interface Customer {
  id: number
  name: string
  email: string
  city: string
  ordersCount: number
}

export interface NavItem {
  to: string
  label: string
  icon: string
}
