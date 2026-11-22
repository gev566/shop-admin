// Настройки Nuxt. Админ-панель работает как SPA: всё рендерится в браузере,
// поэтому её можно положить на любой статический хостинг (GitHub Pages).
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    // На GitHub Pages сайт лежит в подпапке /shop-admin/ — путь задаётся в CI через NUXT_APP_BASE_URL
    head: {
      title: 'Shop Admin',
      htmlAttrs: { lang: 'ru' },
      meta: [{ name: 'description', content: 'Админ-панель интернет-магазина на Nuxt и TypeScript' }],
    },
  },
  typescript: { strict: true },
  devtools: { enabled: false },
})
