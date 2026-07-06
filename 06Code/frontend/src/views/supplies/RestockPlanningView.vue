<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Planificación de Reabastecimiento</h1>
      <p class="admin-view__subtitle">Insumos que requieren ser adquiridos para mantener el inventario operativo.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div class="card-surface p-0 overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Calculando plan de reabastecimiento...</span>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-check2-circle" style="font-size: 3.5rem; color: var(--color-success);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-primary);">¡Inventario completo!</h5>
        <p class="text-muted mb-0">No hay insumos que necesiten reabastecimiento en este momento.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th class="text-white py-3 ps-4 fw-700">#</th>
              <th class="text-white py-3 fw-700">Nombre del Suministro</th>
              <th class="text-white py-3 text-end fw-700">Unidades a Ordenar</th>
              <th class="text-white py-3 text-end pe-4 fw-700">Costo Estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td class="ps-4 text-secondary fw-semibold">{{ index + 1 }}</td>
              <td class="fw-semibold" style="color: var(--color-text-primary);">{{ item.supplyName }}</td>
              <td class="text-end">
                <span class="badge bg-primary fs-6 px-3 py-2">{{ item.unitsToOrder }}</span>
              </td>
              <td class="text-end pe-4 fw-bold" style="color: var(--color-primary-start);">
                ${{ formatCurrency(item.estimatedCost) }}
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
import { blApi } from '@/services/http.js'

const items = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(fetchRestockProvisions)

async function fetchRestockProvisions() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await blApi.get('/fabuladental/supplies/restock-provisions')
    items.value = response.data.itemsToPurchase ?? []
  } catch {
    errorMessage.value = 'No se pudo cargar el plan de reabastecimiento. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  if (value == null) return '0.00'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
