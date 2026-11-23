import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { can as canDo, type Action, type Role } from '~/utils/permissions'

const KEY = 'shop-admin:session'

interface Saved {
  role: Role
  storeName: string
}

function load(): Saved {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Saved> | null
    return {
      role: parsed?.role === 'manager' ? 'manager' : 'admin',
      storeName: typeof parsed?.storeName === 'string' && parsed.storeName.trim() ? parsed.storeName : 'Shop Admin',
    }
  } catch {
    return { role: 'admin', storeName: 'Shop Admin' }
  }
}

// Текущая роль (демо-вход без пароля) и настройки магазина
export const useSessionStore = defineStore('session', () => {
  const saved = load()
  const role = ref<Role>(saved.role)
  const storeName = ref(saved.storeName)

  watch([role, storeName], () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ role: role.value, storeName: storeName.value }))
    } catch {
      // без localStorage не сохраняем
    }
  })

  const can = (action: Action) => canDo(role.value, action)

  return { role, storeName, can }
})
