import { defineConfig } from 'vitest/config'

// Пока тестируем обычные функции без Nuxt-окружения — так тесты быстрее.
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
})
