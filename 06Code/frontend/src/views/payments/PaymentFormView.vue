<template>
  <div class="admin-view">
    <div class="mb-4">
      <div class="d-flex align-items-center gap-2">
        <RouterLink :to="{ name: 'payments' }" class="btn btn-light btn-sm rounded-circle p-2 text-secondary border">
          <i class="bi bi-arrow-left"></i>
        </RouterLink>
        <div>
          <h1 class="m-0">Registrar Pago</h1>
          <p class="admin-view__subtitle m-0">Ingreso de recaudación y consulta automática de saldos del paciente.</p>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">

        <div v-if="successMessage" class="alert alert-success alert-dismissible d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i class="bi bi-check-circle-fill me-2 fs-5"></i>
          {{ successMessage }}
          <button type="button" class="btn-close ms-auto" @click="successMessage = ''"></button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {{ errorMessage }}
        </div>

        <div class="card-surface p-4 p-md-5 mb-4">
          <form @submit.prevent="submitForm" novalidate>

            <div class="mb-4">
              <label for="patientID" class="form-label-styled d-flex justify-content-between align-items-center">
                <span>Cédula de Identidad (10 dígitos)</span>
                <span v-if="form.patientID.length === 10" class="badge bg-primary bg-opacity-10 text-primary fs-8">Cédula verificada</span>
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-person-badge text-muted"></i>
                </span>
                <input
                  id="patientID"
                  v-model="form.patientID"
                  type="text"
                  maxlength="10"
                  class="form-control form-input-styled border-start-0"
                  placeholder="Ej. 1712345678"
                  :class="{ 'input-error': errors.patientID }"
                />
              </div>
              <p v-if="errors.patientID" class="field-error-msg mt-1">{{ errors.patientID }}</p>
            </div>

            <div v-if="form.patientID.length === 10" class="mb-4 transition-base">
              <div v-if="loadingHistory" class="p-3 bg-light rounded-3 text-center text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span> Verificando historial en cobranzas...
              </div>

              <div v-else-if="patientHistory.length === 0" class="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 d-flex align-items-center gap-3">
                <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                  <i class="bi bi-person-check fs-5"></i>
                </div>
                <div>
                  <h6 class="fw-bold text-success m-0">Paciente Nuevo o Sin Saldo Pendiente</h6>
                  <p class="fs-7 text-muted m-0">No se registran cobros anteriores para la cédula <strong>{{ form.patientID }}</strong>.</p>
                </div>
              </div>

              <div v-else class="card-surface p-3 bg-light border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span class="fw-bold text-dark fs-7 d-flex align-items-center gap-1">
                    <i class="bi bi-journal-text text-primary"></i> Historial del Paciente
                  </span>
                  <span class="badge bg-secondary">{{ patientHistory.length }} transacciones</span>
                </div>

                <div v-if="hasPendingDeposit" class="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2 border border-warning">
                  <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                  <div class="fs-7">
                    <strong>¡Atención Recepción!</strong> El paciente tiene un <strong>Depósito (Anticipo)</strong> registrado previamente. Se recomienda cobrar el saldo restante como <strong>Pago Final</strong>.
                  </div>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="bg-white p-2 rounded border text-center">
                      <span class="fs-8 text-muted d-block uppercase">Total Pagado Hasta Hoy</span>
                      <strong class="text-primary fs-6">${{ formatCurrency(patientTotalPaid) }}</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-white p-2 rounded border text-center">
                      <span class="fs-8 text-muted d-block uppercase">Último Pago</span>
                      <strong class="text-dark fs-7">{{ formatDate(patientHistory[0]?.date) }}</strong>
                    </div>
                  </div>
                </div>

                <div class="table-responsive bg-white rounded border">
                  <table class="table table-sm table-borderless m-0 fs-7">
                    <thead class="bg-light text-muted">
                      <tr>
                        <th class="ps-2">Fecha</th>
                        <th>Tipo</th>
                        <th>Método</th>
                        <th class="text-end pe-2">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="hp in patientHistory.slice(0, 3)" :key="hp.id" class="border-top">
                        <td class="ps-2">{{ formatDate(hp.date) }}</td>
                        <td>
                          <span :class="hp.paymentType === 'Deposit' ? 'badge bg-warning bg-opacity-10 text-warning-emphasis' : 'badge bg-success bg-opacity-10 text-success'">
                            {{ hp.paymentType === 'Deposit' ? 'Depósito' : 'Final' }}
                          </span>
                        </td>
                        <td>{{ hp.paymentMethod === 'Cash' ? 'Efectivo' : (hp.paymentMethod === 'Card' ? 'Tarjeta' : 'Transferencia') }}</td>
                        <td class="text-end pe-2 fw-bold">${{ formatCurrency(hp.amount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-4">
                <label for="amount" class="form-label-styled">Monto a Cobrar ($)</label>
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
                  <option value="Deposit" class="fw-semibold" style="background-color: #fff3cd; color: #664d03;">⏳ Depósito (Parcial / Anticipo)</option>
                  <option value="Final" class="fw-semibold" style="background-color: #d1e7dd; color: #0f5132;">✅ Pago Final (Completo)</option>
                </select>
                <p v-if="errors.paymentType" class="field-error-msg mt-1">{{ errors.paymentType }}</p>
              </div>
              <div class="col-sm-4">
                <label for="paymentMethod" class="form-label-styled">Método de Recaudación</label>
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
                  <option value="Cash" class="fw-semibold" style="background-color: #cfe2ff; color: #084298;">💵 Efectivo en Caja</option>
                  <option value="Card" class="fw-semibold" style="background-color: #cff4fc; color: #055160;">💳 Tarjeta de Crédito/Débito</option>
                  <option value="Transfer" class="fw-semibold" style="background-color: #e2e3e5; color: #41464b;">🏦 Transferencia Bancaria</option>
                </select>
                <p v-if="errors.paymentMethod" class="field-error-msg mt-1">{{ errors.paymentMethod }}</p>
              </div>
            </div>

            <div class="mb-5">
              <label for="date" class="form-label-styled">Fecha de Cobro</label>
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
              <button type="submit" class="btn btn-primary-gradient w-100 d-flex justify-content-center align-items-center gap-2 py-3 fw-bold shadow" :disabled="submitting">
                <span v-if="submitting" class="spinner-ring"></span>
                <i v-else class="bi bi-shield-check fs-5"></i>
                <span>{{ submitting ? 'Procesando Transacción...' : 'Registrar Pago y Emitir Comprobante' }}</span>
              </button>
              <button type="button" class="btn btn-outline-secondary px-4" @click="resetForm(false)">
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { blApi } from '@/services/http'

const successMessage = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const allPayments = ref([])
const loadingHistory = ref(false)

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

const fetchAllPayments = async () => {
  loadingHistory.value = true
  try {
    const response = await blApi.get('/fabuladental/payments')
    allPayments.value = response.data.payments || response.data || []
  } catch (error) {
    console.error('Error fetching payments history:', error)
  } finally {
    loadingHistory.value = false
  }
}

onMounted(() => {
  fetchAllPayments()
})

const patientHistory = computed(() => {
  if (!form.patientID || form.patientID.length < 10) return []
  return allPayments.value
    .filter(p => String(p.patientID) === String(form.patientID))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const patientTotalPaid = computed(() => {
  return patientHistory.value.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
})

const hasPendingDeposit = computed(() => {
  return patientHistory.value.some(p => p.paymentType === 'Deposit')
})

const validateForm = () => {
  let isValid = true
  
  if (!form.patientID || !/^[0-9]{10}$/.test(form.patientID)) {
    errors.patientID = 'El ID del paciente debe tener exactamente 10 dígitos numéricos.'
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
    
    successMessage.value = `¡Transacción exitosa! Cobro de $${parseFloat(form.amount).toFixed(2)} registrado en caja para la cédula ${form.patientID}.`
    
    await fetchAllPayments()
    
    resetForm(true)
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

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

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toFixed(2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'No definida'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat('es-ES', options).format(date)
}
</script>

<style scoped>
.form-input-styled {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.form-input-styled:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
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
