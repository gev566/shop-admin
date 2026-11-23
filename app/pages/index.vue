<script setup lang="ts">
import { revenueByDay, summary, topProducts, ordersBetween } from '~/utils/analytics'
import { orderTotal } from '~/utils/orders'
import { LOW_STOCK } from '~/utils/table'

useHead({ title: 'Обзор — Shop Admin' })

const orders = useOrdersStore()
const products = useProductsStore()

// «Сегодня» фиксируем при открытии страницы
const today = new Date()
const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

const stats = computed(() => summary(orders.items, today))
const days = computed(() => revenueByDay(orders.items, today, 30))
const recent = computed(() => orders.sorted.slice(0, 6))
const top = computed(() => topProducts(ordersBetween(orders.items, monthAgo, new Date(today.getTime() + 1)), 5))
const lowStock = computed(() =>
  products.items
    .filter((product) => product.status === 'active' && product.stock < LOW_STOCK)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6),
)

const formatShort = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
</script>

<template>
  <div>
    <PageHeader title="Обзор" subtitle="Показатели за последние 30 дней" />

    <div class="kpis">
      <KpiCard label="Выручка" :kpi="stats.revenue" format="price" />
      <KpiCard label="Заказов" :kpi="stats.orders" />
      <KpiCard label="Средний чек" :kpi="stats.averageCheck" format="price" />
      <KpiCard label="Покупателей" :kpi="stats.customers" />
    </div>

    <section class="card block">
      <h2>Выручка по дням</h2>
      <RevenueChart :data="days" />
    </section>

    <div class="grid">
      <section class="card">
        <div class="head">
          <h2>Последние заказы</h2>
          <NuxtLink to="/orders">Все заказы →</NuxtLink>
        </div>
        <ul class="list">
          <li v-for="order in recent" :key="order.id">
            <NuxtLink :to="`/orders/${order.id}`" class="mono">{{ order.number }}</NuxtLink>
            <span class="grow">{{ orders.customersById.get(order.customerId)?.name }}</span>
            <span class="muted date">{{ formatShort(order.createdAt) }}</span>
            <span class="num">{{ formatPrice(orderTotal(order.items)) }}</span>
            <OrderStatusBadge :status="order.status" />
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="head">
          <h2>Заканчиваются на складе</h2>
          <NuxtLink to="/products?sort=stock">Все товары →</NuxtLink>
        </div>
        <ul v-if="lowStock.length" class="list">
          <li v-for="product in lowStock" :key="product.id">
            <NuxtLink :to="`/products/${product.id}`" class="grow">{{ product.name }}</NuxtLink>
            <span :class="product.stock === 0 ? 'out' : 'low'">
              {{ product.stock === 0 ? 'нет в наличии' : `осталось ${product.stock}` }}
            </span>
          </li>
        </ul>
        <p v-else class="muted">Все товары в продаже есть на складе.</p>
      </section>

      <section class="card">
        <h2>Лидеры продаж</h2>
        <ol class="list top">
          <li v-for="(item, i) in top" :key="item.productId">
            <span class="rank">{{ i + 1 }}</span>
            <NuxtLink :to="`/products/${item.productId}`" class="grow">{{ item.name }}</NuxtLink>
            <span class="muted">{{ item.qty }} шт.</span>
            <span class="num">{{ formatPrice(item.revenue) }}</span>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr)); gap: 12px; margin-bottom: 16px; }
.block { margin-bottom: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 16px; }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.head a { font-size: 0.85rem; text-decoration: none; }
.list { list-style: none; margin: 0; padding: 0; }
.list li { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--border); font-size: 0.92rem; }
.list li:first-child { border-top: 0; }
.list a { color: var(--text); }
.grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.mono { font-family: ui-monospace, Consolas, monospace; font-weight: 600; }
.out { color: var(--danger); font-weight: 600; white-space: nowrap; }
.low { color: var(--warning); font-weight: 600; white-space: nowrap; }
.rank {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.8rem;
}
@media (max-width: 600px) { .date { display: none; } }
</style>
