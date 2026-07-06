<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Registrar Insumo</h1>
      <p class="admin-view__subtitle">Formulario para agregar un nuevo insumo al catálogo.</p>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-8 col-xl-7">

        <div v-if="successMessage" class="alert alert-success alert-dismissible d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ successMessage }}
          <button type="button" class="btn-close ms-auto" @click="successMessage = ''"></button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ errorMessage }}
        </div>

        <div class="card-surface p-4 p-md-5">
          <form @submit.prevent="submitForm" novalidate>

            <div class="mb-4">
              <label for="supplyName" class="form-label-styled">Nombre del Insumo</label>
              <input
                id="supplyName"
                v-model="form.supplyName"
                type="text"
                class="form-input-styled"
                placeholder="Ej. Guantes de látex"
                :class="{ 'input-error': errors.supplyName }"
              />
              <p v-if="errors.supplyName" class="field-error-msg mt-1">{{ errors.supplyName }}</p>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label for="quantity" class="form-label-styled">Cantidad</label>
                <input
                  id="quantity"
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  class="form-input-styled"
                  placeholder="Ej. 100"
                  :class="{ 'input-error': errors.quantity }"
                />
                <p v-if="errors.quantity" class="field-error-msg mt-1">{{ errors.quantity }}</p>
              </div>
              <div class="col-sm-6">
                <label for="unitCost" class="form-label-styled">Costo Unitario ($)</label>
                <input
                  id="unitCost"
                  v-model.number="form.unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input-styled"
                  placeholder="Ej. 25.50"
                  :class="{ 'input-error': errors.unitCost }"
                />
                <p v-if="errors.unitCost" class="field-error-msg mt-1">{{ errors.unitCost }}</p>
              </div>
            </div>

            <div class="row g-3 mb-5">
              <div class="col-sm-6">
                <label for="orderDate" class="form-label-styled">Fecha de Pedido</label>
                <input
                  id="orderDate"
                  v-model="form.orderDate"
                  type="date"
                  class="form-input-styled"
                  :class="{ 'input-error': errors.orderDate }"
                />
                <p v-if="errors.orderDate" class="field-error-msg mt-1">{{ errors.orderDate }}</p>
              </div>
              <div class="col-sm-6">
                <label for="expirationDate" class="form-label-styled">Fecha de Caducidad</label>
                <input
                  id="expirationDate"
                  v-model="form.expirationDate"
                  type="date"
                  class="form-input-styled"
                  :class="{ 'input-error': errors.expirationDate }"
                />
                <p v-if="errors.expirationDate" class="field-error-msg mt-1">{{ errors.expirationDate }}</p>
              </div>
            </div>

            <div class="d-flex gap-3">
              <button type="submit" class="btn-primary-gradient" :disabled="submitting">
                <span v-if="submitting" class="spinner-ring me-1"></span>
                <i v-else class="bi bi-floppy me-1"></i>
                {{ submitting ? 'Guardando...' : 'Registrar Insumo' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="resetForm">
                Limpiar Formulario
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { crudApi } from '@/services/http.js'

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  supplyName: '',
  quantity: '',
  unitCost: '',
  orderDate: '',
  expirationDate: ''
})

const errors = reactive({
  supplyName: '',
  quantity: '',
  unitCost: '',
  orderDate: '',
  expirationDate: ''
})

function validateForm() {
  let valid = true

  errors.supplyName = ''
  errors.quantity = ''
  errors.unitCost = ''
  errors.orderDate = ''
  errors.expirationDate = ''

  if (!form.supplyName.trim()) {
    errors.supplyName = 'El nombre del insumo es obligatorio.'
    valid = false
  }

  if (form.quantity === '' || form.quantity < 1) {
    errors.quantity = 'La cantidad debe ser al menos 1.'
    valid = false
  }

  if (form.unitCost === '' || form.unitCost < 0) {
    errors.unitCost = 'El costo unitario no puede ser negativo.'
    valid = false
  }

  if (!form.orderDate) {
    errors.orderDate = 'La fecha de pedido es obligatoria.'
    valid = false
  }

  if (!form.expirationDate) {
    errors.expirationDate = 'La fecha de caducidad es obligatoria.'
    valid = false
  }

  if (form.orderDate && form.expirationDate && form.expirationDate < form.orderDate) {
    errors.expirationDate = 'La fecha de caducidad no puede ser anterior a la fecha de pedido.'
    valid = false
  }

  return valid
}

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  submitting.value = true
  try {
    await crudApi.post('/fabuladental/supply', {
      supplyName: form.supplyName.trim(),
      quantity: form.quantity,
      unitCost: form.unitCost,
      orderDate: form.orderDate,
      expirationDate: form.expirationDate
    })
    successMessage.value = 'El insumo fue registrado correctamente en el catálogo.'
    resetForm()
  } catch {
    errorMessage.value = 'No se pudo registrar el insumo. Por favor, verifica los datos e intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.supplyName = ''
  form.quantity = ''
  form.unitCost = ''
  form.orderDate = ''
  form.expirationDate = ''
  errors.supplyName = ''
  errors.quantity = ''
  errors.unitCost = ''
  errors.orderDate = ''
  errors.expirationDate = ''
}
</script>

<style scoped>
.input-error {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.12) !important;
}

.field-error-msg {
  color: var(--color-danger);
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0;
}
</style>
