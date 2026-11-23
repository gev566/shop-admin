<script setup lang="ts">
import type { OrderStatus } from '~/types'
import { ORDER_STATUS_LABELS, nextStatuses, orderTotal } from '~/utils/orders'

const route = useRoute()
const store = useOrdersStore()
const { show } = useToast()

const id = Number(route.params.id)
const order = computed(() => store.byId(id))
const customer = computed(() => (order.value ? store.customersById.get(order.value.customerId) : undefined))

useHead({ title: () => `${order.value ? `Заказ ${order.value.number}` : 'Заказ не найден'} — Shop Admin` })

// Подписи кнопок для каждого перехода
const ACTION_LABELS: Record<OrderStatus, string> = {
  new: '',
  paid: 'Отметить оплаченным',
  shipped: 'Отправить',
  delivered: 'Отметить доставленным',
  cancelled: 'Отменить заказ',
}

const actions = computed(() => (order.value ? nextStatuses(order.value.status) : []))
const confirmCancel = ref(false)

function apply(status: OrderStatus) {
  if (status === 'cancelled' && !confirmCancel.value) {
    confirmCancel.value = true
    return
  }
  confirmCancel.value = false
  store.changeStatus(id, status)
  show(`Статус: ${ORDER_STATUS_LABELS[status].toLowerCase()}`)
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div>
    <template v-if="order">
      <NuxtLink to="/orders" class="back">← Все заказы</NuxtLink>
      <PageHeader :title="`Заказ ${order.number}`" :subtitle="formatDateTime(order.createdAt)">
        <OrderStatusBadge :status="order.status" />
      </PageHeader>

      <div class="layout">
        <section class="card">
          <h2>Состав заказа</h2>
          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th class="num">Цена</th>
                <th class="num">Кол-во</th>
                <th class="num">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.productId">
                <td>
                  <NuxtLink :to="`/products/${item.productId}`">{{ item.name }}</NuxtLink>
                </td>
                <td class="num">{{ formatPrice(item.price) }}</td>
                <td class="num">{{ item.qty }}</td>
                <td class="num">{{ formatPrice(item.price * item.qty) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Итого</td>
                <td class="num">{{ formatPrice(orderTotal(order.items)) }}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div class="side">
          <section class="card">
            <h2>Клиент</h2>
            <template v-if="customer">
              <p class="strong">{{ customer.name }}</p>
              <p class="muted">{{ customer.email }}<br>{{ customer.phone }}<br>{{ customer.city }}</p>
            </template>
            <p v-else class="muted">Клиент не найден</p>
          </section>

          <section class="card">
            <h2>Действия</h2>
            <div v-if="actions.length" class="actions">
              <button
                v-for="status in actions"
                :key="status"
                type="button"
                class="btn"
                :class="status === 'cancelled' ? 'btn--danger-outline' : 'btn--primary'"
                @click="apply(status)"
              >
                {{ status === 'cancelled' && confirmCancel ? 'Точно отменить?' : ACTION_LABELS[status] }}
              </button>
            </div>
            <p v-else class="muted">Заказ завершён — менять статус больше нельзя.</p>
          </section>

          <section class="card">
            <h2>История</h2>
            <ol class="timeline">
              <li v-for="(change, i) in [...order.history].reverse()" :key="i">
                <OrderStatusBadge :status="change.status" />
                <span class="muted">{{ formatDateTime(change.at) }}</span>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </template>
    <div v-else class="card">
      <h2>Заказ не найден</h2>
      <NuxtLink to="/orders">Вернуться к списку</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: 10px; text-decoration: none; font-size: 0.9rem; }
.layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 16px; align-items: start; }
.side { display: grid; gap: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 9px 6px; text-align: left; border-bottom: 1px solid var(--border); }
th { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
tfoot td { font-weight: 700; border-bottom: 0; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
td a { color: var(--text); }
.strong { font-weight: 600; margin: 0 0 4px; }
.muted { margin: 0; }
.actions { display: grid; gap: 8px; }
.btn--danger-outline { color: var(--danger); border-color: var(--danger); }
.timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.timeline li { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 0.9rem; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
</style>
