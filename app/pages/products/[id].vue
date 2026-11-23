<script setup lang="ts">
import { draftToProduct, type ProductDraft } from '~/utils/validation'

const route = useRoute()
const store = useProductsStore()
const { show } = useToast()

const id = Number(route.params.id)
const product = computed(() => store.byId(id))

useHead({ title: () => `${product.value?.name ?? 'Товар не найден'} — Shop Admin` })

const session = useSessionStore()
const confirmOpen = ref(false)

function save(draft: ProductDraft) {
  store.update(id, draftToProduct(draft))
  show('Изменения сохранены')
  navigateTo('/products')
}

function remove() {
  const name = product.value?.name
  confirmOpen.value = false
  store.remove(id)
  show(`Товар «${name}» удалён`)
  navigateTo('/products')
}
</script>

<template>
  <div>
    <template v-if="product">
      <PageHeader :title="product.name" :subtitle="`Артикул ${product.sku}`" />
      <ProductForm :product="product" :existing="store.items" :categories="store.categories" @submit="save">
        <template #extra>
          <button v-if="session.can('products.delete')" type="button" class="btn btn--danger-outline" @click="confirmOpen = true">
            Удалить товар
          </button>
        </template>
      </ProductForm>
      <ConfirmDialog
        :open="confirmOpen"
        title="Удалить товар?"
        :text="`«${product.name}» исчезнет из каталога. Это действие нельзя отменить.`"
        @confirm="remove"
        @cancel="confirmOpen = false"
      />
    </template>
    <div v-else class="card">
      <h2>Товар не найден</h2>
      <p class="muted">Возможно, его удалили.</p>
      <NuxtLink to="/products">Вернуться к списку</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.btn--danger-outline { color: var(--danger); border-color: var(--danger); }
</style>
