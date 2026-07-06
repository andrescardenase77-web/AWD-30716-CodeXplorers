<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Historial de Productos Expirados</h1>
      <p class="admin-view__subtitle">Registro de todos los insumos que han superado su fecha de caducidad.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div v-if="!loading && items.length > 0" class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-x-octagon-fill fs-5"></i>
      <span>
        <strong>Atención:</strong> Se encontraron <strong>{{ items.length }}</strong> insumo(s) caducado(s).
        Estos productos deben ser retirados del inventario de inmediato.
      </span>
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Consultando historial de expirados...</span>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-emoji-smile" style="font-size: 3.5rem; color: var(--color-success);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-primary);">¡Excelente noticia!</h5>
        <p class="text-muted mb-0">No existen insumos caducados en el inventario. ¡La gestión del stock está en perfectas condiciones!</p>
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
            <tr v-for="item in items" :key="item.id">
              <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ item.supplyName }}</td>
              <td class="text-end fw-semibold">{{ item.quantity }}</td>
              <td class="text-end fw-semibold">${{ formatCurrency(item.unitCost) }}</td>
              <td>{{ formatDate(item.orderDate) }}</td>
              <td class="fw-bold" style="color: var(--color-danger);">{{ formatDate(item.expirationDate) }}</td>
              <td class="pe-4">
                <span class="badge bg-danger fs-6 px-3 py-2">
                  <i class="bi bi-x-circle me-1"></i> Caducado
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

onMounted(fetchExpiredItems)

async function fetchExpiredItems() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await crudApi.get('/fabuladental/supplies/statuses/Expired')
    items.value = response.data
  } catch {
    errorMessage.value = 'No se pudo cargar el historial de productos expirados. Por favor, intenta de nuevo.'
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
