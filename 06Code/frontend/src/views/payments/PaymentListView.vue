<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>Gestión de Pagos</h1>
        <p class="admin-view__subtitle">Listado de pagos registrados en el sistema.</p>
      </div>
      <RouterLink :to="{ name: 'payment-register' }" class="btn btn-primary-gradient d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold rounded-3 shadow-sm flex-shrink-0">
        <i class="bi bi-plus-lg"></i> Registrar Pago
      </RouterLink>
    </div>

    <div v-if="successMessage" class="alert alert-success alert-dismissible d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      {{ successMessage }}
      <button type="button" class="btn-close ms-auto" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div v-if="payments.length > 0" class="mb-3">
      <div class="input-group">
        <span class="input-group-text bg-transparent border-end-0">
          <i class="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          v-model="searchQuery"
          class="form-control border-start-0"
          placeholder="Buscar pago por cédula..."
        />
      </div>
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Cargando pagos...</span>
      </div>

      <div v-else-if="payments.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-wallet2" style="font-size: 3.5rem; color: var(--color-border);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-secondary);">No hay pagos registrados</h5>
        <p class="text-muted">La lista está vacía. Comienza registrando tu primer pago.</p>
        <RouterLink :to="{ name: 'payment-register' }" class="btn btn-primary-gradient d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold rounded-3 shadow-sm mt-3">
          <i class="bi bi-plus-lg"></i> Registrar Pago
        </RouterLink>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead style="background-color: var(--color-surface); border-bottom: 2px solid var(--color-border);">
            <tr>
              <th class="py-3 ps-4 fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Cédula Paciente</th>
              <th class="py-3 fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Detalle</th>
              <th class="py-3 text-end fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Monto ($)</th>
              <th class="py-3 fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Fecha</th>
              <th class="py-3 fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Estado</th>
              <th class="py-3 pe-4 fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ payment.patientID }}</td>
              <td>{{ getPaymentDetails(payment) }}</td>
              <td class="text-end">
                <span class="fw-semibold">${{ formatCurrency(payment.amount) }}</span>
              </td>
              <td>{{ formatDate(payment.date) }}</td>
              <td style="border-color: var(--color-border);">
                <span :class="getStatusBadgeClass(payment.status)" class="badge fs-7 px-3 py-2 rounded-pill fw-semibold">
                  {{ payment.status === 'Completed' ? 'Completado' : (payment.status === 'Partial' ? 'Parcial' : payment.status) }}
                </span>
              </td>
              <td class="pe-4">
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="openEditModal(payment)"
                  >
                    <i class="bi bi-pencil"></i>
                    Editar
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="deletePayment(payment)"
                  >
                    <span v-if="deletingId === payment.id" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-trash3"></i>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content card-surface border-0 p-3 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold m-0" style="color: var(--color-text-primary);">Editar Pago</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePayment">
              <div class="mb-3">
                <label class="form-label-styled">Cédula del Paciente</label>
                <input type="text" v-model="editForm.patientID" class="form-input-styled" required />
              </div>
              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label-styled">Tipo de Pago</label>
                  <select v-model="editForm.paymentType" class="form-select form-input-styled" required>
                    <option value="Deposit">Depósito</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
                <div class="col-sm-6">
                  <label class="form-label-styled">Método</label>
                  <select v-model="editForm.paymentMethod" class="form-select form-input-styled" required>
                    <option value="Cash">Efectivo</option>
                    <option value="Card">Tarjeta</option>
                    <option value="Transfer">Transferencia</option>
                  </select>
                </div>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-sm-12">
                  <label class="form-label-styled">Monto ($)</label>
                  <input type="number" step="0.01" min="0" v-model.number="editForm.amount" class="form-input-styled" required />
                </div>
              </div>
              <div class="mb-4">
                <label class="form-label-styled">Fecha de Pago</label>
                <input type="date" v-model="editForm.date" class="form-input-styled" required />
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancelar</button>
                <button type="submit" class="btn-primary-gradient border-0 px-4" :disabled="saving">
                  <span v-if="saving" class="spinner-ring me-1"></span>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 p-4 shadow-lg" style="border-radius: 16px;">
          <div class="modal-body text-center p-0">
            <div class="mb-4 mt-2">
              <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle" style="width: 80px; height: 80px;">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 2.5rem;"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-3" style="color: var(--color-text-primary);">¿Eliminar Pago?</h4>
            <p class="text-muted mb-4 fs-6">
              Estás a punto de eliminar el pago asociado a la cédula <strong class="text-dark">{{ paymentToDelete?.patientID }}</strong>. <br/> Esta acción no se puede deshacer.
            </p>
            <div class="d-flex gap-3 justify-content-center mt-2">
              <button type="button" class="btn btn-light px-4 py-2 fw-semibold" @click="closeDeleteModal" style="border-radius: 8px; color: var(--color-text-secondary); background: var(--color-background);">Cancelar</button>
              <button type="button" class="btn btn-danger px-4 py-2 fw-semibold" @click="confirmDelete" :disabled="deletingId !== null" style="border-radius: 8px;">
                <span v-if="deletingId !== null" class="spinner-border spinner-border-sm me-2"></span>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { blApi } from '@/services/http'

const payments = ref([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const searchQuery = ref('')

const showEditModal = ref(false)
const editForm = ref({})
const saving = ref(false)
const deletingId = ref(null)

const showDeleteModal = ref(false)
const paymentToDelete = ref(null)

const fetchPayments = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await blApi.get('/fabuladental/payments')
    payments.value = response.data.payments || response.data || []
  } catch (error) {
    console.error('Error fetching payments:', error)
    errorMessage.value = 'No se pudo cargar la lista de pagos. Por favor, intenta de nuevo.'
    payments.value = [] // Fallback to empty
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPayments()
})

const filteredPayments = computed(() => {
  if (!searchQuery.value) return payments.value
  const query = searchQuery.value.toLowerCase()
  return payments.value.filter(
    (p) => p.patientID && String(p.patientID).toLowerCase().includes(query)
  )
})

const getPaymentDetails = (payment) => {
  if (!payment.paymentType) return 'Sin detalle'
  const type = payment.paymentType === 'Deposit' ? 'Depósito' : 'Final';
  const method = payment.paymentMethod === 'Cash' ? 'Efectivo' : (payment.paymentMethod === 'Card' ? 'Tarjeta' : 'Transferencia');
  return `${type} - ${method}`;
}

const formatCurrency = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'No definida'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('es-ES', options).format(date)
}

const getStatusBadgeClass = (status) => {
  if (status === 'Pagado' || status === 'Completed') return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
  if (status === 'Pendiente' || status === 'Partial') return 'bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25'
  return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'
}

const openEditModal = (payment) => {
  editForm.value = { ...payment }
  if (editForm.value.date) {
    editForm.value.date = new Date(editForm.value.date).toISOString().split('T')[0]
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {}
}

const savePayment = async () => {
  saving.value = true
  try {
    const id = editForm.value.id
    const payload = { ...editForm.value }
    await blApi.put(`/fabuladental/payments/${id}`, payload)
    
    const index = payments.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      payments.value[index] = { ...payload }
    }
    successMessage.value = 'Pago actualizado correctamente.'
    closeEditModal()
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error updating payment:', error)
    alert('Ocurrió un error al actualizar el pago.')
  } finally {
    saving.value = false
  }
}

const deletePayment = (payment) => {
  paymentToDelete.value = payment
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  paymentToDelete.value = null
}

const confirmDelete = async () => {
  if (!paymentToDelete.value) return
  
  deletingId.value = paymentToDelete.value.id
  try {
    await blApi.delete(`/fabuladental/payments/${paymentToDelete.value.id}`)
    payments.value = payments.value.filter((p) => p.id !== paymentToDelete.value.id)
    successMessage.value = 'Pago eliminado correctamente.'
    closeDeleteModal()
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error deleting payment:', error)
    alert('Error al eliminar el pago.')
  } finally {
    deletingId.value = null
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
  transition: all 0.2s ease;
}
.form-input-styled:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
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
