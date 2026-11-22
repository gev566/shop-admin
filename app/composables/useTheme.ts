// Тема оформления: светлая, тёмная или как в системе.
// Выбор хранится в localStorage и применяется через атрибут data-theme на <html>.
export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'shop-admin:theme'

export function useTheme() {
  // useState — общее реактивное состояние Nuxt: одно значение на всё приложение
  const theme = useState<Theme>('theme', () => 'system')

  function apply(value: Theme) {
    theme.value = value
    if (value === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // без localStorage тема просто не запомнится
    }
  }

  function restore() {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY)
    } catch {
      saved = null
    }
    apply(saved === 'light' || saved === 'dark' ? saved : 'system')
  }

  return { theme, apply, restore }
}
