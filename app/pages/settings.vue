<script setup lang="ts">
import { ROLE_LABELS } from '~/utils/permissions'

useHead({ title: 'Настройки — Shop Admin' })
// Страница только для администратора — проверяет глобальный middleware
definePageMeta({ permission: 'settings.view' })

const session = useSessionStore()
const products = useProductsStore()
const orders = useOrdersStore()
const { show } = useToast()

const name = ref(session.storeName)
const nameError = computed(() => {
  const value = name.value.trim()
  if (!value) return 'Введите название'
  if (value.length > 40) return 'Не длиннее 40 символов'
  return ''
})

function saveName() {
  if (nameError.value) return
  session.storeName = name.value.trim()
  show('Название сохранено')
}

const confirmReset = ref(false)
function resetAll() {
  products.resetDemo()
  orders.resetDemo()
  confirmReset.value = false
  show('Демо-данные восстановлены')
}

const ROLE_RIGHTS = {
  admin: ['Всё, что может менеджер', 'Удаление товаров и отмена заказов', 'Доступ к настройкам'],
  manager: ['Добавление и редактирование товаров', 'Смена статуса заказа (кроме отмены)', 'Просмотр клиентов'],
} as const
</script>

<template>
  <div>
    <PageHeader title="Настройки" subtitle="Параметры магазина и роли пользователей" />

    <div class="grid">
      <section class="card">
        <h2>Магазин</h2>
        <form novalidate @submit.prevent="saveName">
          <label class="field">
            <span>Название магазина</span>
            <input v-model="name" type="text" maxlength="60" :aria-invalid="nameError ? (true as const) : undefined">
            <small v-if="nameError" class="error">{{ nameError }}</small>
            <small v-else class="muted">Показывается в меню слева</small>
          </label>
          <button type="submit" class="btn btn--primary" :disabled="!!nameError || name.trim() === session.storeName">
            Сохранить
          </button>
        </form>
      </section>

      <section class="card">
        <h2>Роли</h2>
        <div v-for="(rights, role) in ROLE_RIGHTS" :key="role" class="role">
          <p class="strong">{{ ROLE_LABELS[role] }} <span v-if="session.role === role" class="muted">— это вы</span></p>
          <ul><li v-for="item in rights" :key="item">{{ item }}</li></ul>
        </div>
        <p class="muted small">Роль переключается в шапке. В настоящем проекте её выдавал бы сервер после входа.</p>
      </section>

      <section class="card danger">
        <h2>Демо-данные</h2>
        <p class="muted">Товары и заказы хранятся в браузере. Можно вернуть их к исходному виду.</p>
        <button type="button" class="btn btn--danger-outline" @click="confirmReset = true">Сбросить демо-данные</button>
      </section>
    </div>

    <ConfirmDialog
      :open="confirmReset"
      title="Сбросить демо-данные?"
      text="Все изменения в товарах и заказах будут потеряны."
      confirm-label="Сбросить"
      @confirm="resetAll"
      @cancel="confirmReset = false"
    />
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px; align-items: start; }
h2 { font-size: 1rem; margin: 0 0 12px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.error { color: var(--danger); }
.role + .role { margin-top: 12px; }
.role p { margin: 0 0 4px; }
.role ul { margin: 0; padding-left: 20px; }
.strong { font-weight: 600; }
.small { font-size: 0.85rem; margin-top: 14px; }
</style>
