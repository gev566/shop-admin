// Короткие уведомления «Сохранено», «Удалено» в углу экрана
export interface Toast {
  id: number
  text: string
}

let nextId = 1

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(text: string, ms = 3000) {
    const toast = { id: nextId++, text }
    toasts.value.push(toast)
    setTimeout(() => {
      toasts.value = toasts.value.filter((item) => item.id !== toast.id)
    }, ms)
  }

  return { toasts, show }
}
