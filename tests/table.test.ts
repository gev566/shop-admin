import { describe, expect, it } from 'vitest'
import { createDemoProducts } from '../app/data/products'
import type { Product } from '../app/types'
import { filterProducts, paginate, sortProducts, stockLevel } from '../app/utils/table'

const make = (id: number, over: Partial<Product> = {}): Product => ({
  id,
  name: `Товар ${id}`,
  sku: `SKU-${id}`,
  price: id * 1000,
  stock: 10,
  category: 'Дом',
  status: 'active',
  ...over,
})

describe('filterProducts', () => {
  const items = [
    make(1, { name: 'Умные часы', sku: 'EL-1001', category: 'Электроника' }),
    make(2, { name: 'Плед флисовый', category: 'Дом', status: 'draft' }),
    make(3, { name: 'Часы настенные', category: 'Дом' }),
  ]

  it('ищет по названию без учёта регистра и по артикулу', () => {
    expect(filterProducts(items, { query: 'ЧАСЫ', category: '', status: '' }).map((p) => p.id)).toEqual([1, 3])
    expect(filterProducts(items, { query: 'el-1001', category: '', status: '' }).map((p) => p.id)).toEqual([1])
  })

  it('сочетает поиск с категорией и статусом', () => {
    expect(filterProducts(items, { query: 'часы', category: 'Дом', status: '' }).map((p) => p.id)).toEqual([3])
    expect(filterProducts(items, { query: '', category: '', status: 'draft' }).map((p) => p.id)).toEqual([2])
  })
})

describe('sortProducts', () => {
  const items = [make(1, { name: 'Яблоко', price: 500 }), make(2, { name: 'арбуз', price: 1500 }), make(3, { name: 'Банан', price: 500 })]

  it('сортирует строки по алфавиту без учёта регистра', () => {
    expect(sortProducts(items, 'name', 'asc').map((p) => p.name)).toEqual(['арбуз', 'Банан', 'Яблоко'])
  })

  it('сортирует числа и при равенстве сохраняет порядок по id', () => {
    expect(sortProducts(items, 'price', 'desc').map((p) => p.id)).toEqual([2, 1, 3])
  })

  it('не меняет исходный массив', () => {
    const before = items.map((p) => p.id)
    sortProducts(items, 'name', 'desc')
    expect(items.map((p) => p.id)).toEqual(before)
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1)

  it('режет список на страницы', () => {
    const page = paginate(items, 3, 10)
    expect(page.items).toEqual([21, 22, 23])
    expect(page.totalPages).toBe(3)
    expect(page.total).toBe(23)
  })

  it('держит номер страницы в допустимых пределах', () => {
    expect(paginate(items, 99, 10).page).toBe(3)
    expect(paginate(items, 0, 10).page).toBe(1)
    expect(paginate([], 1, 10)).toMatchObject({ page: 1, totalPages: 1, items: [] })
  })
})

describe('stockLevel', () => {
  it('различает «нет», «мало» и «достаточно»', () => {
    expect([0, 3, 5].map(stockLevel)).toEqual(['out', 'low', 'ok'])
  })
})

describe('createDemoProducts', () => {
  it('всегда генерирует одинаковый каталог с уникальными id и артикулами', () => {
    const a = createDemoProducts()
    expect(a).toEqual(createDemoProducts())
    expect(new Set(a.map((p) => p.id)).size).toBe(a.length)
    expect(new Set(a.map((p) => p.sku)).size).toBe(a.length)
    expect(a.some((p) => p.stock === 0)).toBe(true)
  })
})
