import { describe, expect, it } from 'vitest'
import { can } from '~/utils/permissions'

describe('can', () => {
  it('администратору разрешено всё', () => {
    expect(can('admin', 'products.delete')).toBe(true)
    expect(can('admin', 'orders.cancel')).toBe(true)
    expect(can('admin', 'settings.view')).toBe(true)
  })

  it('менеджер работает с товарами и заказами, но не удаляет и не отменяет', () => {
    expect(can('manager', 'products.create')).toBe(true)
    expect(can('manager', 'orders.changeStatus')).toBe(true)
    expect(can('manager', 'customers.view')).toBe(true)
    expect(can('manager', 'products.delete')).toBe(false)
    expect(can('manager', 'orders.cancel')).toBe(false)
    expect(can('manager', 'settings.view')).toBe(false)
  })
})
