import type { Product, ProductStatus } from '~/types'

// Черновик формы: всё, что вводит пользователь, кроме id.
// Цена и остаток хранятся строками, пока человек печатает, — так поле можно оставить пустым.
export interface ProductDraft {
  name: string
  sku: string
  category: string
  price: string
  stock: string
  status: ProductStatus
}

export type ProductErrors = Partial<Record<keyof ProductDraft, string>>

export const SKU_PATTERN = /^[A-Z]{2,4}-\d{3,6}$/

export function emptyDraft(): ProductDraft {
  return { name: '', sku: '', category: '', price: '', stock: '0', status: 'draft' }
}

export function draftFromProduct(product: Product): ProductDraft {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    status: product.status,
  }
}

// Проверяет черновик и возвращает ошибки по полям. Пустой объект — всё в порядке.
// existing и currentId нужны, чтобы проверить уникальность артикула (свой артикул при редактировании не считается дублем).
export function validateProduct(draft: ProductDraft, existing: Product[], currentId?: number): ProductErrors {
  const errors: ProductErrors = {}
  const name = draft.name.trim()
  const sku = draft.sku.trim().toUpperCase()

  if (!name) errors.name = 'Введите название'
  else if (name.length < 3) errors.name = 'Название слишком короткое — минимум 3 символа'
  else if (name.length > 80) errors.name = 'Не длиннее 80 символов'

  if (!sku) errors.sku = 'Введите артикул'
  else if (!SKU_PATTERN.test(sku)) errors.sku = 'Формат: 2–4 латинские буквы, дефис и цифры, например EL-1024'
  else if (existing.some((product) => product.sku === sku && product.id !== currentId)) errors.sku = 'Такой артикул уже есть'

  if (!draft.category.trim()) errors.category = 'Выберите или введите категорию'

  const price = Number(draft.price)
  if (draft.price.trim() === '') errors.price = 'Укажите цену'
  else if (!Number.isInteger(price) || price <= 0) errors.price = 'Цена — целое число больше нуля'
  else if (price > 10_000_000) errors.price = 'Слишком большая цена'

  const stock = Number(draft.stock)
  if (draft.stock.trim() === '') errors.stock = 'Укажите остаток'
  else if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Остаток — целое число, не меньше нуля'

  // Нельзя выставить в продажу товар, которого нет на складе
  if (!errors.stock && draft.status === 'active' && stock === 0) errors.status = 'Нельзя выставить в продажу товар с нулевым остатком'

  return errors
}

// Превращает проверенный черновик в данные товара: обрезает пробелы, приводит типы
export function draftToProduct(draft: ProductDraft): Omit<Product, 'id'> {
  return {
    name: draft.name.trim(),
    sku: draft.sku.trim().toUpperCase(),
    category: draft.category.trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    status: draft.status,
  }
}
