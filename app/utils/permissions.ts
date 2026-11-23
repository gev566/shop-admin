// Роли и права. Всё, что можно делать в интерфейсе, описано одним списком действий,
// а для каждой роли — какие из них ей разрешены. Компоненты спрашивают can(role, action)
// и не знают, какая именно роль у пользователя.

export type Role = 'admin' | 'manager'

export const ROLE_LABELS: Record<Role, string> = { admin: 'Администратор', manager: 'Менеджер' }

export type Action =
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.changeStatus'
  | 'orders.cancel'
  | 'customers.view'
  | 'settings.view'

const RULES: Record<Role, Action[]> = {
  admin: ['products.create', 'products.edit', 'products.delete', 'orders.changeStatus', 'orders.cancel', 'customers.view', 'settings.view'],
  // менеджер работает с заказами и товарами, но не удаляет товары, не отменяет заказы и не трогает настройки
  manager: ['products.create', 'products.edit', 'orders.changeStatus', 'customers.view'],
}

export function can(role: Role, action: Action): boolean {
  return RULES[role].includes(action)
}
