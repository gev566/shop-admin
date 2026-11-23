<script setup lang="ts">
import { customerStats, filterCustomers, sortCustomers, type CustomerSort } from '~/utils/customers'

useHead({ title: 'Клиенты — Shop Admin' })

const store = useOrdersStore()
const route = useRoute()
const router = useRouter()

const PER_PAGE = 12
const SORTS: { value: CustomerSort; label: string }[] = [
  { value: 'spent', label: 'По сумме покупок' },
  { value: 'orders', label: 'По числу заказов' },
  { value: 'lastOrderAt', label: 'По последнему заказу' },
  { value: 'name', label: 'По имени' },
]

// Поиск, сортировка и страница — в адресной строке, как в товарах и заказах
const str = (value: unknown) => (typeof value === 'string' ? value : '')
const query = computed(() => str(route.query.q))
const sort = computed<CustomerSort>(() => {
  const value = str(route.query.sort)
  return SORTS.some((item) => item.value === value) ? (value as CustomerSort) : 'spent'
})
const page = computed(() => Number(route.query.page) || 1)

function update(patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...route.query, ...patch })) {
    if (value === undefined || value === '' || value === null) continue
    if (key === 'page' && Number(value) === 1) continue
    if (key === 'sort' && value === 'spent') continue
    next[key] = String(value)
  }
  router.replace({ query: next })
}

const rows = computed(() => customerStats(store.customers, store.items))
const visible = computed(() => sortCustomers(filterCustomers(rows.value, query.value), sort.value))
const current = computed(() => paginate(visible.value, page.value, PER_PAGE))
const buyers = computed(() => rows.value.filter((row) => row.stats.orders > 0).length)
</script>

<template>
  <div>
    <PageHeader
      title="Клиенты"
      :subtitle="`${rows.length} ${plural(rows.length, ['клиент', 'клиента', 'клиентов'])}, из них с заказами — ${buyers}`"
    />

    <div class="card">
      <div class="toolbar">
        <label class="search">
          <span class="visually-hidden">Поиск</span>
          <input
            type="search"
            :value="query"
            placeholder="Имя, email, телефон или город"
            @input="update({ q: ($event.target as HTMLInputElement).value, page: 1 })"
          >
        </label>
        <label>
          <span class="visually-hidden">Сортировка</span>
          <select :value="sort" @change="update({ sort: ($event.target as HTMLSelectElement).value, page: 1 })">
            <option v-for="item in SORTS" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Клиент</th>
              <th class="hide-sm">Город</th>
              <th class="num">Заказов</th>
              <th class="num">Сумма покупок</th>
              <th class="hide-sm">Последний заказ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in current.items" :key="row.id">
              <td>
                <NuxtLink :to="`/customers/${row.id}`" class="strong">{{ row.name }}</NuxtLink>
                <span class="muted email">{{ row.email }}</span>
              </td>
              <td class="hide-sm">{{ row.city }}</td>
              <td class="num">{{ row.stats.orders }}</td>
              <td class="num">{{ formatPrice(row.stats.spent) }}</td>
              <td class="muted hide-sm">{{ row.stats.lastOrderAt ? formatDate(row.stats.lastOrderAt) : '—' }}</td>
            </tr>
            <tr v-if="current.items.length === 0">
              <td colspan="5" class="empty">Клиентов не найдено.</td>
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
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
.search { flex: 1 1 260px; }
.search input { width: 100%; max-width: 420px; }
.table-wrap { overflow-x: auto; margin: 0 -18px; padding: 0 18px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--border); }
th { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
tbody tr:hover { background: var(--surface-2); }
.strong { font-weight: 600; }
.email { display: block; font-size: 0.82rem; overflow-wrap: anywhere; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.empty { text-align: center; color: var(--muted); padding: 32px 8px; }
.footer { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 14px; }
@media (max-width: 600px) { .hide-sm { display: none; } }
</style>
