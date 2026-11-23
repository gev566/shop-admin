<script setup lang="ts">
import type { OrderStatus } from '~/types'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, countByStatus, filterOrders, orderTotal } from '~/utils/orders'

useHead({ title: 'Заказы — Shop Admin' })

const store = useOrdersStore()
const route = useRoute()
const router = useRouter()

const PER_PAGE = 15

// Как и в товарах, состояние списка хранится в адресной строке
const str = (value: unknown) => (typeof value === 'string' ? value : '')
const query = computed(() => str(route.query.q))
const status = computed(() => str(route.query.status) as OrderStatus | '')
const page = computed(() => Number(route.query.page) || 1)

function update(patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...route.query, ...patch })) {
    if (value === undefined || value === '' || value === null) continue
    if (key === 'page' && Number(value) === 1) continue
    next[key] = String(value)
  }
  router.replace({ query: next })
}

const counts = computed(() => countByStatus(store.items))
const filtered = computed(() =>
  filterOrders(store.sorted, store.customersById, { query: query.value, status: status.value }),
)
const current = computed(() => paginate(filtered.value, page.value, PER_PAGE))

const tabs = computed(() => [
  { value: '' as const, label: 'Все', count: store.items.length },
  ...ORDER_STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABELS[value], count: counts.value[value] })),
])

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div>
    <PageHeader
      title="Заказы"
      :subtitle="`${counts.new} ${plural(counts.new, ['новый заказ', 'новых заказа', 'новых заказов'])} ждут обработки`"
    />

    <div class="tabs" role="tablist" aria-label="Статус заказа">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        class="tab"
        :aria-selected="status === tab.value"
        @click="update({ status: tab.value, page: 1 })"
      >
        {{ tab.label }} <span class="count">{{ tab.count }}</span>
      </button>
    </div>

    <div class="card">
      <label class="search">
        <span class="visually-hidden">Поиск</span>
        <input
          type="search"
          :value="query"
          placeholder="Номер заказа или имя клиента"
          @input="update({ q: ($event.target as HTMLInputElement).value, page: 1 })"
        >
      </label>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Заказ</th>
              <th>Дата</th>
              <th>Клиент</th>
              <th class="num">Позиций</th>
              <th class="num">Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in current.items" :key="order.id">
              <td><NuxtLink :to="`/orders/${order.id}`" class="number">{{ order.number }}</NuxtLink></td>
              <td class="muted">{{ formatDateTime(order.createdAt) }}</td>
              <td>{{ store.customersById.get(order.customerId)?.name ?? '—' }}</td>
              <td class="num">{{ order.items.reduce((sum, item) => sum + item.qty, 0) }}</td>
              <td class="num">{{ formatPrice(orderTotal(order.items)) }}</td>
              <td><OrderStatusBadge :status="order.status" /></td>
            </tr>
            <tr v-if="current.items.length === 0">
              <td colspan="6" class="empty">Заказов не найдено.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <span class="muted">Найдено: {{ current.total }}</span>
        <DataPagination :page="current.page" :total-pages="current.totalPages" @change="update({ page: $event })" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tab {
  font: inherit;
  font-size: 0.9rem;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}
.tab[aria-selected='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-text); font-weight: 600; }
.count { opacity: 0.7; font-variant-numeric: tabular-nums; margin-left: 2px; }

.search { display: block; margin-bottom: 14px; }
.search input { width: 100%; max-width: 420px; }

.table-wrap { overflow-x: auto; margin: 0 -18px; padding: 0 18px; }
table { width: 100%; border-collapse: collapse; min-width: 680px; }
th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--border); }
th { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
tbody tr:hover { background: var(--surface-2); }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.number { font-weight: 600; font-family: ui-monospace, Consolas, monospace; }
.empty { text-align: center; color: var(--muted); padding: 32px 8px; }
.footer { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 14px; }
</style>
