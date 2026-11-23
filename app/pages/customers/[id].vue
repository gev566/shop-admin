<script setup lang="ts">
import { orderTotal } from '~/utils/orders'
import { customerStats } from '~/utils/customers'

const route = useRoute()
const store = useOrdersStore()

const id = Number(route.params.id)
const customer = computed(() => store.customersById.get(id))
const stats = computed(() => (customer.value ? customerStats([customer.value], store.items)[0]!.stats : null))
const orders = computed(() => store.sorted.filter((order) => order.customerId === id))
// Средний чек считаем только по заказам, которые не отменены
const paidCount = computed(() => orders.value.filter((order) => order.status !== 'cancelled').length)
const average = computed(() => (stats.value && paidCount.value ? Math.round(stats.value.spent / paidCount.value) : 0))

useHead({ title: () => `${customer.value?.name ?? 'Клиент не найден'} — Shop Admin` })
</script>

<template>
  <div>
    <template v-if="customer && stats">
      <NuxtLink to="/customers" class="back">← Все клиенты</NuxtLink>
      <PageHeader :title="customer.name" :subtitle="`Клиент с ${formatDate(customer.registeredAt)}`" />

      <div class="layout">
        <section class="card">
          <h2>Контакты</h2>
          <dl>
            <dt>Email</dt><dd><a :href="`mailto:${customer.email}`">{{ customer.email }}</a></dd>
            <dt>Телефон</dt><dd><a :href="`tel:${customer.phone.replace(/[^+\d]/g, '')}`">{{ customer.phone }}</a></dd>
            <dt>Город</dt><dd>{{ customer.city }}</dd>
          </dl>
        </section>

        <div class="stats">
          <div class="card stat"><span class="muted">Заказов</span><strong>{{ stats.orders }}</strong></div>
          <div class="card stat"><span class="muted">Сумма покупок</span><strong>{{ formatPrice(stats.spent) }}</strong></div>
          <div class="card stat"><span class="muted">Средний чек</span><strong>{{ formatPrice(average) }}</strong></div>
        </div>
      </div>

      <section class="card">
        <h2>Заказы</h2>
        <ul v-if="orders.length" class="orders">
          <li v-for="order in orders" :key="order.id">
            <NuxtLink :to="`/orders/${order.id}`" class="number">{{ order.number }}</NuxtLink>
            <span class="muted">{{ formatDate(order.createdAt) }}</span>
            <span class="num">{{ formatPrice(orderTotal(order.items)) }}</span>
            <OrderStatusBadge :status="order.status" />
          </li>
        </ul>
        <p v-else class="muted">Клиент ещё ничего не заказывал.</p>
      </section>
    </template>

    <template v-else>
      <PageHeader title="Клиент не найден" subtitle="Возможно, ссылка устарела." />
      <NuxtLink to="/customers" class="btn">К списку клиентов</NuxtLink>
    </template>
  </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: 10px; color: var(--muted); }
.layout { display: grid; grid-template-columns: minmax(min(320px, 100%), 1fr) 2fr; gap: 16px; margin-bottom: 16px; }
@media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
h2 { font-size: 1rem; margin: 0 0 12px; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; }
dt { color: var(--muted); }
dd { margin: 0; word-break: break-word; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.stat { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.stat strong { font-size: 1.5rem; font-variant-numeric: tabular-nums; }
.orders { list-style: none; margin: 0; padding: 0; }
.orders li {
  display: grid;
  grid-template-columns: 110px 1fr auto 120px;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.orders li:last-child { border-bottom: 0; }
.orders li > :last-child { justify-self: end; }
.number { font-weight: 600; font-family: ui-monospace, Consolas, monospace; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
@media (max-width: 600px) { .orders li { grid-template-columns: 1fr auto; } }
</style>
