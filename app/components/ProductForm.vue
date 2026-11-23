<script setup lang="ts">
import type { Product } from '~/types'
import { draftFromProduct, emptyDraft, validateProduct, type ProductDraft } from '~/utils/validation'

// Форма товара: одна и та же для создания и редактирования.
// Если передан product — поля заполняются его данными.
const props = defineProps<{ product?: Product; existing: Product[]; categories: string[] }>()
const emit = defineEmits<{ submit: [draft: ProductDraft] }>()

const draft = reactive<ProductDraft>(props.product ? draftFromProduct(props.product) : emptyDraft())
// Ошибку поля показываем только после того, как человек из него ушёл, — не ругаемся во время ввода
const touched = reactive<Partial<Record<keyof ProductDraft, boolean>>>({})
const submitted = ref(false)

const errors = computed(() => validateProduct(draft, props.existing, props.product?.id))
const visibleError = (field: keyof ProductDraft) => (touched[field] || submitted.value ? errors.value[field] : undefined)
const isValid = computed(() => Object.keys(errors.value).length === 0)

function onSubmit() {
  submitted.value = true
  if (!isValid.value) {
    // переводим фокус на первое поле с ошибкой
    const first = Object.keys(errors.value)[0]
    document.getElementById(`field-${first}`)?.focus()
    return
  }
  emit('submit', { ...draft })
}

const fieldAttrs = (field: keyof ProductDraft) => ({
  id: `field-${field}`,
  'aria-invalid': visibleError(field) ? (true as const) : undefined,
  'aria-describedby': visibleError(field) ? `error-${field}` : undefined,
  onBlur: () => {
    touched[field] = true
  },
})
</script>

<template>
  <form class="card form" novalidate @submit.prevent="onSubmit">
    <div class="grid">
      <div class="field field--wide">
        <label for="field-name">Название</label>
        <input v-model="draft.name" v-bind="fieldAttrs('name')" maxlength="80" autocomplete="off">
        <p v-if="visibleError('name')" :id="'error-name'" class="error">{{ visibleError('name') }}</p>
      </div>

      <div class="field">
        <label for="field-sku">Артикул</label>
        <input v-model="draft.sku" v-bind="fieldAttrs('sku')" placeholder="EL-1024" autocomplete="off" class="mono">
        <p v-if="visibleError('sku')" :id="'error-sku'" class="error">{{ visibleError('sku') }}</p>
      </div>

      <div class="field">
        <label for="field-category">Категория</label>
        <input v-model="draft.category" v-bind="fieldAttrs('category')" list="categories" autocomplete="off">
        <datalist id="categories">
          <option v-for="item in categories" :key="item" :value="item" />
        </datalist>
        <p v-if="visibleError('category')" :id="'error-category'" class="error">{{ visibleError('category') }}</p>
      </div>

      <div class="field">
        <label for="field-price">Цена, ֏</label>
        <input v-model="draft.price" v-bind="fieldAttrs('price')" inputmode="numeric" class="num">
        <p v-if="visibleError('price')" :id="'error-price'" class="error">{{ visibleError('price') }}</p>
      </div>

      <div class="field">
        <label for="field-stock">Остаток на складе</label>
        <input v-model="draft.stock" v-bind="fieldAttrs('stock')" inputmode="numeric" class="num">
        <p v-if="visibleError('stock')" :id="'error-stock'" class="error">{{ visibleError('stock') }}</p>
      </div>

      <fieldset class="field field--wide">
        <legend>Статус</legend>
        <div class="radios">
          <label><input v-model="draft.status" type="radio" value="active" @change="touched.status = true"> В продаже</label>
          <label><input v-model="draft.status" type="radio" value="draft" @change="touched.status = true"> Черновик</label>
          <label><input v-model="draft.status" type="radio" value="archived" @change="touched.status = true"> В архиве</label>
        </div>
        <p v-if="visibleError('status')" :id="'error-status'" class="error">{{ visibleError('status') }}</p>
      </fieldset>
    </div>

    <div class="form-actions">
      <slot name="extra" />
      <div class="spacer" />
      <NuxtLink to="/products" class="btn">Отмена</NuxtLink>
      <button type="submit" class="btn btn--primary">{{ product ? 'Сохранить' : 'Добавить товар' }}</button>
    </div>
  </form>
</template>

<style scoped>
.form { max-width: 760px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.field { display: grid; gap: 6px; align-content: start; min-width: 0; }
.field--wide { grid-column: 1 / -1; }
label, legend { font-size: 0.85rem; font-weight: 600; }
fieldset { border: 0; padding: 0; margin: 0; }
input:not([type='radio']) { width: 100%; }
input[aria-invalid='true'] { border-color: var(--danger); }
.radios { display: flex; flex-wrap: wrap; gap: 18px; padding-top: 4px; }
.radios label { display: flex; gap: 6px; align-items: center; font-weight: 400; font-size: 0.95rem; }
.error { margin: 0; color: var(--danger); font-size: 0.85rem; }
.num { font-variant-numeric: tabular-nums; }
.mono { font-family: ui-monospace, Consolas, monospace; text-transform: uppercase; }
.form-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; align-items: center; }
.spacer { flex: 1; }
a.btn { text-decoration: none; }
@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
</style>
