import { describe, expect, it } from 'vitest'
import type { Product } from '../app/types'
import { draftToProduct, emptyDraft, validateProduct, type ProductDraft } from '../app/utils/validation'

const existing: Product[] = [
  { id: 1, name: 'Умные часы', sku: 'EL-1001', category: 'Электроника', price: 50000, stock: 3, status: 'active' },
]

const valid = (over: Partial<ProductDraft> = {}): ProductDraft => ({
  name: 'Беспроводная мышь',
  sku: 'EL-2001',
  category: 'Электроника',
  price: '12500',
  stock: '10',
  status: 'active',
  ...over,
})

describe('validateProduct', () => {
  it('пропускает корректный товар', () => {
    expect(validateProduct(valid(), existing)).toEqual({})
  })

  it('требует все обязательные поля', () => {
    const errors = validateProduct({ ...emptyDraft(), stock: '' }, existing)
    expect(Object.keys(errors).sort()).toEqual(['category', 'name', 'price', 'sku', 'stock'])
  })

  it('проверяет формат артикула и приводит его к верхнему регистру', () => {
    expect(validateProduct(valid({ sku: 'мышь' }), existing).sku).toMatch(/Формат/)
    expect(validateProduct(valid({ sku: 'el-2001' }), existing)).toEqual({})
  })

  it('не даёт повторить чужой артикул, но разрешает свой при редактировании', () => {
    expect(validateProduct(valid({ sku: 'el-1001' }), existing).sku).toBe('Такой артикул уже есть')
    expect(validateProduct(valid({ sku: 'EL-1001' }), existing, 1)).toEqual({})
  })

  it('требует целую положительную цену и неотрицательный остаток', () => {
    expect(validateProduct(valid({ price: '0' }), existing).price).toBeDefined()
    expect(validateProduct(valid({ price: '99.5' }), existing).price).toBeDefined()
    expect(validateProduct(valid({ stock: '-1' }), existing).stock).toBeDefined()
    expect(validateProduct(valid({ stock: '0', status: 'draft' }), existing)).toEqual({})
  })

  it('не разрешает выставить в продажу товар с нулевым остатком', () => {
    expect(validateProduct(valid({ stock: '0', status: 'active' }), existing).status).toBeDefined()
  })
})

describe('draftToProduct', () => {
  it('обрезает пробелы и приводит типы', () => {
    expect(draftToProduct(valid({ name: '  Мышь  ', sku: ' el-2001 ', price: '12500', stock: '7' }))).toEqual({
      name: 'Мышь',
      sku: 'EL-2001',
      category: 'Электроника',
      price: 12500,
      stock: 7,
      status: 'active',
    })
  })
})
