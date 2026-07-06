<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Alertas de Caducidad</h1>
      <p class="admin-view__subtitle">Insumos próximos a vencer. Se recomienda su uso prioritario en pacientes.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div v-if="!loading && items.length > 0" class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <span>
        <strong>¡Atención!</strong> Se encontraron <strong>{{ items.length }}</strong> insumo(s) próximos a caducar.
        Úsalos antes que los demás para evitar desperdicios.
      </span>
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Verificando fechas de caducidad...</span>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-calendar-check" style="font-size: 3.5rem; color: var(--color-success);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-primary);">¡Sin alertas de caducidad!</h5>
        <p class="text-muted mb-0">No hay insumos próximos a vencer en este momento. El inventario está en buen estado.</p>
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
              <th class="text-white py-3 pe-4 fw-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="table-row--warning">
              <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ item.supplyName }}</td>
              <td class="text-end fw-semibold">{{ item.quantity }}</td>
              <td class="text-end fw-semibold">${{ formatCurrency(item.unitCost) }}</td>
              <td>{{ formatDate(item.orderDate) }}</td>
              <td class="fw-bold" style="color: var(--color-warning);">{{ formatDate(item.expirationDate) }}</td>
              <td class="pe-4">
                <span class="badge bg-warning text-dark fs-6 px-3 py-2">
                  <i class="bi bi-clock me-1"></i> Por Vencer
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { crudApi } from '@/services/http.js'

const items = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(fetchExpirationAlerts)

async function fetchExpirationAlerts() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await crudApi.get('/fabuladental/supplies/statuses/NextExpiration')
    items.value = response.data
  } catch {
    errorMessage.value = 'No se pudo cargar las alertas de caducidad. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
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
</script>

<style scoped>
.table-row--warning {
  background-color: rgba(214, 158, 46, 0.04);
}

.table-row--warning:hover {
  background-color: rgba(214, 158, 46, 0.10) !important;
}
</style>
