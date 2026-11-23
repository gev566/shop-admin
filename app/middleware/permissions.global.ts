// Глобальный middleware: срабатывает перед каждым переходом.
// Если у страницы указано право, а у текущей роли его нет, — возвращаем на обзор.
export default defineNuxtRouteMiddleware((to) => {
  const permission = to.meta.permission
  if (!permission) return
  const session = useSessionStore()
  if (!session.can(permission)) {
    useToast().show('Этот раздел доступен только администратору')
    return navigateTo('/')
  }
})
