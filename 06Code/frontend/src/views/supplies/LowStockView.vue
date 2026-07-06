<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>Control de Stock Bajo</h1>
        <p class="admin-view__subtitle">Insumos con existencias por debajo del umbral crítico (≤ {{ THRESHOLD }} unidades).</p>
      </div>
      <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto flex-shrink-0" @click="fetchLowStock" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ 'spin-icon': loading }"></i>
        Actualizar
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert" v-if="!loading && supplies.length > 0">
      <i class="bi bi-exclamation-triangle-fill fs-5"></i>
      <span>
        <strong>Atención:</strong> Se encontraron <strong>{{ supplies.length }}</strong> insumo(s) con nivel crítico de existencias. Considera reabastecer pronto.
      </span>
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Verificando stock...</span>
      </div>

      <div v-else-if="supplies.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-shield-check" style="font-size: 3.5rem; color: var(--color-success);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-primary);">¡Stock en buen estado!</h5>
        <p class="text-muted mb-0">¡Excelente! No hay insumos con stock crítico en este momento.</p>
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
            <tr v-for="supply in supplies" :key="supply.id">
              <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ supply.supplyName }}</td>
              <td class="text-end">
                <span class="badge bg-danger fs-6 px-3 py-2">{{ supply.quantity }}</span>
              </td>
              <td class="text-end fw-semibold">${{ formatCurrency(supply.unitCost) }}</td>
              <td>{{ formatDate(supply.orderDate) }}</td>
              <td>{{ formatDate(supply.expirationDate) }}</td>
              <td class="pe-4">
                <span :class="getStatusBadgeClass(supply.status)" class="badge fs-6 px-3 py-2">
                  {{ getStatusLabel(supply.status) }}
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

const THRESHOLD = 5

const supplies = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(fetchLowStock)

async function fetchLowStock() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await crudApi.get(`/fabuladental/supplies/quantity-thresholds/${THRESHOLD}`)
    supplies.value = response.data
  } catch {
    errorMessage.value = 'No se pudo obtener el reporte de stock bajo. Por favor, intenta de nuevo.'
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
.spin-icon {
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width: 768px) {
  .w-md-auto {
    width: auto !important;
  }
}
</style>
