<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>Catálogo de Inventario</h1>
        <p class="admin-view__subtitle">Listado completo de insumos registrados en el sistema.</p>
      </div>
      <RouterLink :to="{ name: 'supply-register' }" class="btn-primary-gradient w-100 w-md-auto text-center flex-shrink-0">
        <i class="bi bi-plus-lg"></i> Registrar Insumo
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

    <div v-if="supplies.length > 0" class="mb-3">
      <div class="input-group">
        <span class="input-group-text bg-transparent border-end-0">
          <i class="bi bi-search text-muted"></i>
        </span>
        <input
          ref="searchInputRef"
          type="text"
          v-model="searchQuery"
          class="form-control border-start-0"
          placeholder="Buscar insumo por nombre..."
        />
      </div>
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Cargando insumos...</span>
      </div>

      <div v-else-if="supplies.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-box-seam" style="font-size: 3.5rem; color: var(--color-border);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-secondary);">No hay insumos registrados</h5>
        <p class="text-muted">El catálogo está vacío. Comienza registrando tu primer insumo.</p>
        <RouterLink :to="{ name: 'supply-register' }" class="btn-primary-gradient mt-2">
          <i class="bi bi-plus-lg"></i> Registrar Insumo
        </RouterLink>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th class="text-white py-3 ps-4 fw-700">Nombre</th>
              <th class="text-white py-3 text-end fw-700">Cantidad</th>
              <th class="text-white py-3 text-end fw-700">Costo Unitario</th>
              <th class="text-white py-3 fw-700">Fecha Pedido</th>
              <th class="text-white py-3 fw-700">Fecha Caducidad</th>
              <th class="text-white py-3 fw-700">Estado</th>
              <th class="text-white py-3 pe-4 fw-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supply in filteredSupplies" :key="supply.id">
              <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ supply.supplyName }}</td>
              <td class="text-end fw-semibold">{{ supply.quantity }}</td>
              <td class="text-end">
                <span class="fw-semibold">${{ formatCurrency(supply.unitCost) }}</span>
              </td>
              <td>{{ formatDate(supply.orderDate) }}</td>
              <td>{{ formatDate(supply.expirationDate) }}</td>
              <td>
                <span :class="getStatusBadgeClass(supply.status)" class="badge fs-6 px-3 py-2">
                  {{ getStatusLabel(supply.status) }}
                </span>
              </td>
              <td class="pe-4">
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="openEditModal(supply)"
                  >
                    <i class="bi bi-pencil"></i>
                    Editar
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="deletingId === supply.id"
                    @click="deleteSupply(supply)"
                  >
                    <span v-if="deletingId === supply.id" class="spinner-border spinner-border-sm me-1"></span>
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

    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content card-surface border-0 p-3 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold m-0" style="color: var(--color-text-primary);">Editar Insumo</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSupply">
              <div class="mb-3">
                <label class="form-label-styled">Nombre del Insumo</label>
                <input type="text" v-model="editForm.supplyName" class="form-input-styled" required />
              </div>
              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label-styled">Cantidad</label>
                  <input type="number" v-model.number="editForm.quantity" class="form-input-styled" min="1" required />
                  <p v-if="editForm.quantity <= 0" class="text-danger small mt-1">La cantidad debe ser mayor a 0.</p>
                </div>
                <div class="col-sm-6">
                  <label class="form-label-styled">Costo Unitario ($)</label>
                  <input type="number" step="0.01" v-model.number="editForm.unitCost" class="form-input-styled" required />
                </div>
              </div>
              <div class="row g-3 mb-4">
                <div class="col-sm-6">
                  <label class="form-label-styled">Fecha de Pedido</label>
                  <input type="date" v-model="editForm.orderDate" class="form-input-styled" required />
                </div>
                <div class="col-sm-6">
                  <label class="form-label-styled">Fecha de Caducidad</label>
                  <input type="date" v-model="editForm.expirationDate" class="form-input-styled" required />
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancelar</button>
                <button type="submit" class="btn-primary-gradient border-0 px-4" :disabled="saving || editForm.quantity <= 0">
                  <span v-if="saving" class="spinner-ring me-1"></span>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { crudApi } from '@/services/http.js'
import { fromEvent, map, debounceTime, distinctUntilChanged } from 'rxjs'

const supplies = ref([])
const loading = ref(true)
const deletingId = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const searchQuery = ref('')
const debouncedQuery = ref('')
const searchInputRef = ref(null)
let searchSubscription = null

const showEditModal = ref(false)
const saving = ref(false)
const editingSupplyId = ref(null)
const editForm = ref({
  supplyName: '',
  quantity: 1,
  unitCost: 0,
  orderDate: '',
  expirationDate: ''
})

const filteredSupplies = computed(() => {
  if (!debouncedQuery.value.trim()) return supplies.value
  const query = debouncedQuery.value.toLowerCase()
  return supplies.value.filter((s) => s.supplyName.toLowerCase().includes(query))
})

watch(searchInputRef, (el) => {
  if (el) {
    const searchInput$ = fromEvent(el, 'input').pipe(
      map((e) => e.target.value.trim()),
      debounceTime(300),
      distinctUntilChanged()
    )
    searchSubscription = searchInput$.subscribe((query) => {
      debouncedQuery.value = query
    })
  } else {
    if (searchSubscription) {
      searchSubscription.unsubscribe()
      searchSubscription = null
    }
  }
})

onMounted(() => {
  fetchSupplies()
})

onUnmounted(() => {
  if (searchSubscription) {
    searchSubscription.unsubscribe()
  }
})

async function fetchSupplies() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await crudApi.get('/fabuladental/supplies')
    supplies.value = response.data
  } catch {
    errorMessage.value = 'No se pudo cargar el catálogo de insumos. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

async function deleteSupply(supply) {
  if (!confirm(`¿Estás seguro de que deseas eliminar "${supply.supplyName}"? Esta acción no se puede deshacer.`)) {
    return
  }
  deletingId.value = supply.id
  try {
    await crudApi.delete(`/fabuladental/supplies/${supply.id}`)
    supplies.value = supplies.value.filter((s) => s.id !== supply.id)
    successMessage.value = `El insumo "${supply.supplyName}" fue eliminado correctamente.`
    setTimeout(() => { successMessage.value = '' }, 5000)
  } catch {
    errorMessage.value = 'No se pudo eliminar el insumo. Por favor, intenta de nuevo.'
  } finally {
    deletingId.value = null
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return ''
  return dateString.substring(0, 10)
}

function openEditModal(supply) {
  editingSupplyId.value = supply.id
  editForm.value = {
    supplyName: supply.supplyName,
    quantity: supply.quantity,
    unitCost: Number(supply.unitCost),
    orderDate: formatDateForInput(supply.orderDate),
    expirationDate: formatDateForInput(supply.expirationDate)
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingSupplyId.value = null
}

async function saveSupply() {
  if (editForm.value.quantity <= 0) return
  saving.value = true
  errorMessage.value = ''
  try {
    await crudApi.put(`/fabuladental/supplies/${editingSupplyId.value}`, {
      supplyName: editForm.value.supplyName,
      quantity: editForm.value.quantity,
      unitCost: editForm.value.unitCost,
      orderDate: editForm.value.orderDate,
      expirationDate: editForm.value.expirationDate
    })
    const idx = supplies.value.findIndex((s) => s.id === editingSupplyId.value)
    if (idx !== -1) {
      supplies.value[idx] = {
        ...supplies.value[idx],
        supplyName: editForm.value.supplyName,
        quantity: editForm.value.quantity,
        unitCost: editForm.value.unitCost,
        orderDate: editForm.value.orderDate,
        expirationDate: editForm.value.expirationDate
      }
    }
    successMessage.value = 'El insumo fue actualizado correctamente.'
    setTimeout(() => { successMessage.value = '' }, 5000)
    closeEditModal()
  } catch {
    errorMessage.value = 'No se pudo actualizar el insumo. Por favor, intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
  if (value == null) return '0.00'
  return Number(value).toFixed(2)
}

function getStatusBadgeClass(status) {
  const map = {
    Current: 'bg-success',
    NextExpiration: 'bg-warning text-dark',
    Expired: 'bg-danger'
  }
  return map[status] ?? 'bg-secondary'
}

function getStatusLabel(status) {
  const map = {
    Current: 'Vigente',
    NextExpiration: 'Por Vencer',
    Expired: 'Caducado'
  }
  return map[status] ?? status
}
</script>

<style scoped>
@media (min-width: 768px) {
  .w-md-auto {
    width: auto !important;
  }
}
</style>
