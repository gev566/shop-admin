// Форматирование чисел и дат для интерфейса.
// Функции из app/utils Nuxt подключает автоматически — импортировать их в компонентах не нужно.

// 125000 → «125 000 ֏»
export function formatPrice(amount: number, currency = 'AMD'): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(amount)
}

// '2026-11-22T10:30:00Z' → «22 нояб. 2026 г.»
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Склонение по числу: plural(5, ['товар', 'товара', 'товаров']) → «товаров»
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}
