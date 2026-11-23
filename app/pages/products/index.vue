<script setup lang="ts">
import type { ProductStatus } from '~/types'
import type { SortDir, SortKey } from '~/utils/table'

useHead({ title: 'Товары — Shop Admin' })

const store = useProductsStore()
const route = useRoute()
const router = useRouter()

const PER_PAGE = 10

// Фильтры, сортировка и страница хранятся в адресной строке (?q=…&page=2).
// Поэтому ссылкой на отфильтрованный список можно поделиться, а «назад» в браузере работает как ожидается.
const str = (value: unknown) => (typeof value === 'string' ? value : '')
const query = computed(() => str(route.query.q))
const category = computed(() => str(route.query.category))
const status = computed(() => str(route.query.status) as ProductStatus | '')
const sortKey = computed(() => (str(route.query.sort) || 'name') as SortKey)
const sortDir = computed(() => (str(route.query.dir) === 'desc' ? 'desc' : 'asc') as SortDir)
const page = computed(() => Number(route.query.page) || 1)

function update(patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {}
  const merged = { ...route.query, ...patch }
  for (const [key, value] of Object.entries(merged)) {
    // пустые значения и значения по умолчанию в адрес не пишем — он остаётся коротким
    if (value === undefined || value === '' || value === null) continue
    if ((key === 'page' && Number(value) === 1) || (key === 'sort' && value === 'name') || (key === 'dir' && value === 'asc')) continue
    next[key] = String(value)
  }
  router.replace({ query: next })
}

// При смене фильтра возвращаемся на первую страницу
const setFilter = (key: 'q' | 'category' | 'status', value: string) => update({ [key]: value, page: 1 })

function toggleSort(key: SortKey) {
  const dir: SortDir = sortKey.value === key && sortDir.value === 'asc' ? 'desc' : 'asc'
  update({ sort: key, dir })
}

// Цепочка: фильтр → сортировка → страница. computed пересчитывается только при изменении входных данных
const filtered = computed(() =>
  filterProducts(store.items, { query: query.value, category: category.value, status: status.value }),
)
const sorted = computed(() => sortProducts(filtered.value, sortKey.value, sortDir.value))
const current = computed(() => paginate(sorted.value, page.value, PER_PAGE))

const hasFilters = computed(() => Boolean(query.value || category.value || status.value))
const resetFilters = () => router.replace({ query: {} })

const { show } = useToast()
function resetDemo() {
  store.resetDemo()
  show('Каталог возвращён к демо-данным')
}

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Название' },
  { key: 'sku', label: 'Артикул' },
  { key: 'category', label: 'Категория' },
  { key: 'price', label: 'Цена', numeric: true },
  { key: 'stock', label: 'Остаток', numeric: true },
]

const ariaSort = (key: SortKey) => (sortKey.value === key ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none')
const STOCK_HINT = { out: 'Нет в наличии', low: 'Заканчивается', ok: '' }
</script>

<template>
  <div>
    <PageHeader
      title="Товары"
      :subtitle="`${store.items.length} ${plural(store.items.length, ['товар', 'товара', 'товаров'])} в каталоге`"
    >
      <NuxtLink to="/products/new" class="btn btn--primary">Добавить товар</NuxtLink>
    </PageHeader>

    <div class="card">
      <div class="toolbar">
        <label class="search">
          <span class="visually-hidden">Поиск</span>
          <input
            type="search"
            :value="query"
            placeholder="Поиск по названию или артикулу"
            @input="setFilter('q', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label>
          <span class="visually-hidden">Категория</span>
          <select :value="category" @change="setFilter('category', ($event.target as HTMLSelectElement).value)">
            <option value="">Все категории</option>
            <option v-for="item in store.categories" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span class="visually-hidden">Статус</span>
          <select :value="status" @change="setFilter('status', ($event.target as HTMLSelectElement).value)">
            <option value="">Все статусы</option>
            <option value="active">В продаже</option>
            <option value="draft">Черновик</option>
            <option value="archived">В архиве</option>
          </select>
        </label>
        <button v-if="hasFilters" type="button" class="btn" @click="resetFilters">Сбросить</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" :aria-sort="ariaSort(col.key)" :class="{ num: col.numeric }">
                <button type="button" class="sort" @click="toggleSort(col.key)">
                  {{ col.label }}
                  <span class="arrow" aria-hidden="true">{{ sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
                </button>
              </th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in current.items" :key="product.id">
              <td class="name">
                <NuxtLink :to="`/products/${product.id}`">{{ product.name }}</NuxtLink>
              </td>
              <td class="muted mono">{{ product.sku }}</td>
              <td>{{ product.category }}</td>
              <td class="num">{{ formatPrice(product.price) }}</td>
              <td class="num">
                <span :class="`stock stock--${stockLevel(product.stock)}`" :title="STOCK_HINT[stockLevel(product.stock)]">
                  {{ product.stock }}
                </span>
              </td>
              <td><StatusBadge :status="product.status" /></td>
            </tr>
            <tr v-if="current.items.length === 0">
              <td colspan="6" class="empty">Ничего не нашлось. Измените поиск или сбросьте фильтры.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <span class="muted">
          Найдено: {{ current.total }}
          · <button type="button" class="link" @click="resetDemo">вернуть демо-данные</button>
        </span>
        <DataPagination :page="current.page" :total-pages="current.totalPages" @change="update({ page: $event })" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.search { flex: 1 1 260px; }
.search input { width: 100%; }

.table-wrap { overflow-x: auto; margin: 0 -18px; padding: 0 18px; }
table { width: 100%; border-collapse: collapse; min-width: 720px; }
th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--border); }
th { font-size: 0.8rem; color: var(--muted); font-weight: 600; white-space: nowrap; }
tbody tr:hover { background: var(--surface-2); }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.name { font-weight: 600; }
.name a { color: var(--text); text-decoration: none; }
.name a:hover { color: var(--accent); text-decoration: underline; }
.link { all: unset; cursor: pointer; color: var(--accent); }
.link:hover { text-decoration: underline; }
a.btn { text-decoration: none; }
.mono { font-family: ui-monospace, Consolas, monospace; font-size: 0.85rem; }

.sort { all: unset; cursor: pointer; display: inline-flex; gap: 4px; align-items: center; }
.sort:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
th.num .sort { flex-direction: row-reverse; }
.arrow { opacity: 0.6; }
th[aria-sort='ascending'], th[aria-sort='descending'] { color: var(--text); }

.stock { font-weight: 600; }
.stock--out { color: var(--danger); }
.stock--low { color: var(--warning); }

.empty { text-align: center; color: var(--muted); padding: 32px 8px; }

.footer { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 14px; }
</style>
