import type { Action } from '~/utils/permissions'

// Страница может потребовать право: definePageMeta({ permission: 'settings.view' })
declare module '#app' {
  interface PageMeta {
    permission?: Action
  }
}

export {}
