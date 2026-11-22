import { describe, expect, it } from 'vitest'
import { formatDate, formatPrice, plural } from '../app/utils/format'

describe('formatPrice', () => {
  it('форматирует сумму с пробелами между разрядами и без копеек', () => {
    const text = formatPrice(125000).replace(/\s/g, ' ')
    expect(text).toMatch(/^125 000/)
    expect(text).not.toMatch(/,/)
  })
})

describe('formatDate', () => {
  it('показывает дату по-русски', () => {
    expect(formatDate('2026-11-22T10:30:00')).toMatch(/22 нояб\.? 2026/)
  })
})

describe('plural', () => {
  const forms: [string, string, string] = ['товар', 'товара', 'товаров']
  it.each([
    [1, 'товар'],
    [2, 'товара'],
    [5, 'товаров'],
    [11, 'товаров'],
    [21, 'товар'],
    [22, 'товара'],
    [112, 'товаров'],
  ])('%i → %s', (n, expected) => {
    expect(plural(n, forms)).toBe(expected)
  })
})
