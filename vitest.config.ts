import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Пока тестируем обычные функции без Nuxt-окружения — так тесты быстрее.
// Алиас «~» указывает на папку app, как в самом Nuxt.
export default defineConfig({
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'] },
})
