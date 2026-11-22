import type { Product, ProductStatus } from '~/types'

// Чистые функции для таблицы: поиск, фильтры, сортировка, страницы.
// Они ничего не знают о Vue, поэтому их легко тестировать отдельно.

export interface ProductFilters {
  query: string
  category: string // '' — все категории
  status: ProductStatus | '' // '' — все статусы
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.query.trim().toLowerCase()
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false
    if (filters.status && product.status !== filters.status) return false
    if (!query) return true
    return product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
  })
}

export type SortKey = 'name' | 'sku' | 'category' | 'price' | 'stock'
export type SortDir = 'asc' | 'desc'

const collator = new Intl.Collator('ru', { numeric: true })

// Возвращает новый массив — исходный не меняется (важно для реактивности Vue)
export function sortProducts(products: Product[], key: SortKey, dir: SortDir): Product[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...products].sort((a, b) => {
    const x = a[key]
    const y = b[key]
    const result = typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y))
    return result * sign || a.id - b.id // при равенстве — стабильный порядок по id
  })
}

export interface Page<T> {
  items: T[]
  page: number // текущая страница, начиная с 1
  totalPages: number
  total: number
}

export function paginate<T>(items: T[], page: number, perPage: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages) // номер всегда в допустимых пределах
  const start = (current - 1) * perPage
  return { items: items.slice(start, start + perPage), page: current, totalPages, total: items.length }
}

export const LOW_STOCK = 5

// Уровень остатка для подсветки: нет в наличии, заканчивается, нормально
export function stockLevel(stock: number): 'out' | 'low' | 'ok' {
  if (stock <= 0) return 'out'
  if (stock < LOW_STOCK) return 'low'
  return 'ok'
}
