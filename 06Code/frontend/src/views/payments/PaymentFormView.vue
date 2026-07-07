<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Registrar Pago</h1>
      <p class="admin-view__subtitle">Formulario para registrar un nuevo pago en el sistema.</p>
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
              <label for="patientID" class="form-label-styled">ID del Paciente (Cédula 10 dígitos)</label>
              <input
                id="patientID"
                v-model="form.patientID"
                type="text"
                class="form-input-styled"
                placeholder="Ej. 1712345678"
                :class="{ 'input-error': errors.patientID }"
              />
              <p v-if="errors.patientID" class="field-error-msg mt-1">{{ errors.patientID }}</p>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-4">
                <label for="amount" class="form-label-styled">Monto ($)</label>
                <input
                  id="amount"
                  v-model.number="form.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input-styled"
                  placeholder="Ej. 150.00"
                  :class="{ 'input-error': errors.amount }"
                />
                <p v-if="errors.amount" class="field-error-msg mt-1">{{ errors.amount }}</p>
              </div>
              <div class="col-sm-4">
                <label for="paymentType" class="form-label-styled">Tipo de Pago</label>
                <select
                  id="paymentType"
                  v-model="form.paymentType"
                  class="form-select form-input-styled"
                  :class="[
                    { 'input-error': errors.paymentType },
                    form.paymentType === 'Deposit' ? 'text-warning-emphasis bg-warning bg-opacity-10 fw-semibold border-warning border-opacity-50' : '',
                    form.paymentType === 'Final' ? 'text-success bg-success bg-opacity-10 fw-semibold border-success border-opacity-50' : ''
                  ]"
                >
                  <option value="" disabled class="text-muted bg-white">Seleccione</option>
                  <option value="Deposit" class="fw-semibold" style="background-color: #fff3cd; color: #664d03;">Depósito (Parcial)</option>
                  <option value="Final" class="fw-semibold" style="background-color: #d1e7dd; color: #0f5132;">Final (Completo)</option>
                </select>
                <p v-if="errors.paymentType" class="field-error-msg mt-1">{{ errors.paymentType }}</p>
              </div>
              <div class="col-sm-4">
                <label for="paymentMethod" class="form-label-styled">Método</label>
                <select
                  id="paymentMethod"
                  v-model="form.paymentMethod"
                  class="form-select form-input-styled"
                  :class="[
                    { 'input-error': errors.paymentMethod },
                    form.paymentMethod === 'Cash' ? 'text-primary-emphasis bg-primary bg-opacity-10 fw-semibold border-primary border-opacity-50' : '',
                    form.paymentMethod === 'Card' ? 'text-info-emphasis bg-info bg-opacity-10 fw-semibold border-info border-opacity-50' : '',
                    form.paymentMethod === 'Transfer' ? 'text-dark bg-dark bg-opacity-10 fw-semibold border-dark border-opacity-50' : ''
                  ]"
                >
                  <option value="" disabled class="text-muted bg-white">Seleccione</option>
                  <option value="Cash" class="fw-semibold" style="background-color: #cfe2ff; color: #084298;">Efectivo</option>
                  <option value="Card" class="fw-semibold" style="background-color: #cff4fc; color: #055160;">Tarjeta</option>
                  <option value="Transfer" class="fw-semibold" style="background-color: #e2e3e5; color: #41464b;">Transferencia</option>
                </select>
                <p v-if="errors.paymentMethod" class="field-error-msg mt-1">{{ errors.paymentMethod }}</p>
              </div>
            </div>

            <div class="mb-5">
              <label for="date" class="form-label-styled">Fecha de Pago</label>
              <input
                id="date"
                v-model="form.date"
                type="date"
                class="form-input-styled"
                :class="{ 'input-error': errors.date }"
              />
              <p v-if="errors.date" class="field-error-msg mt-1">{{ errors.date }}</p>
            </div>

            <div class="d-flex flex-column flex-md-row gap-3">
              <button type="submit" class="btn-primary-gradient w-100 text-center" :disabled="submitting">
                <span v-if="submitting" class="spinner-ring me-1"></span>
                <i v-else class="bi bi-floppy me-1"></i>
                {{ submitting ? 'Guardando...' : 'Registrar Pago' }}
              </button>
              <button type="button" class="btn btn-outline-secondary w-100" @click="resetForm">
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
import { blApi } from '@/services/http'

const successMessage = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const form = reactive({
  patientID: '',
  amount: null,
  paymentType: 'Final',
  paymentMethod: 'Cash',
  date: getTodayDate()
})

const errors = reactive({
  patientID: '',
  amount: '',
  paymentType: '',
  paymentMethod: '',
  date: ''
})

const validateForm = () => {
  let isValid = true
  
  if (!form.patientID || !/^[0-9]{10}$/.test(form.patientID)) {
    errors.patientID = 'El ID del paciente debe tener 10 dígitos.'
    isValid = false
  } else {
    errors.patientID = ''
  }

  if (form.amount === null || form.amount === '' || form.amount <= 0) {
    errors.amount = 'Ingrese un monto válido mayor a 0.'
    isValid = false
  } else {
    errors.amount = ''
  }

  if (!form.paymentType || !['Deposit', 'Final'].includes(form.paymentType)) {
    errors.paymentType = 'Seleccione un tipo de pago válido.'
    isValid = false
  } else {
    errors.paymentType = ''
  }

  if (!form.paymentMethod || !['Cash', 'Card', 'Transfer'].includes(form.paymentMethod)) {
    errors.paymentMethod = 'Seleccione un método de pago válido.'
    isValid = false
  } else {
    errors.paymentMethod = ''
  }

  if (!form.date) {
    errors.date = 'La fecha es obligatoria.'
    isValid = false
  } else {
    const todayStr = getTodayDate()
    if (form.date > todayStr) {
      errors.date = 'La fecha de pago no puede ser en el futuro.'
      isValid = false
    } else {
      errors.date = ''
    }
  }

  return isValid
}

const submitForm = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) return

  submitting.value = true

  try {
    const payload = {
      patientID: form.patientID,
      amount: form.amount,
      paymentType: form.paymentType,
      paymentMethod: form.paymentMethod,
      date: form.date
    }

    await blApi.post('/fabuladental/payments', payload)
    
    successMessage.value = 'Pago registrado exitosamente.'
    resetForm(true) // Reset without clearing success message immediately
    
    // Auto hide success message
    setTimeout(() => {
      successMessage.value = ''
    }, 4000)

  } catch (error) {
    console.error('Error submitting payment:', error)
    errorMessage.value = error.response?.data?.message || error.response?.data?.error || 'Ocurrió un error al registrar el pago. Por favor, verifica la conexión e intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

const resetForm = (keepMessages = false) => {
  form.patientID = ''
  form.amount = null
  form.paymentType = 'Final'
  form.paymentMethod = 'Cash'
  form.date = getTodayDate()
  
  errors.patientID = ''
  errors.amount = ''
  errors.paymentType = ''
  errors.paymentMethod = ''
  errors.date = ''
  
  if (!keepMessages) {
    successMessage.value = ''
    errorMessage.value = ''
  }
}
</script>

<style scoped>
.form-input-styled {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.form-input-styled:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.input-error {
  border-color: #ef4444;
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0;
}

.form-label-styled {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.spinner-ring {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
