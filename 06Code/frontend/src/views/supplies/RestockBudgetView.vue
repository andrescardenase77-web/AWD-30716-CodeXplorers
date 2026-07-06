<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Presupuesto de Compra</h1>
      <p class="admin-view__subtitle">Capital total requerido para restablecer el inventario de la clínica.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <span class="ms-3 text-secondary fw-semibold">Calculando presupuesto...</span>
    </div>

    <template v-else>
      <div class="budget-card card-surface">
        <div class="budget-card__header">
          <div class="budget-card__icon-wrapper">
            <i class="bi bi-wallet2"></i>
          </div>
          <p class="budget-card__label">Presupuesto Consolidado de Reabastecimiento</p>
          <p class="budget-card__sublabel">Inversión total necesaria para reponer los insumos requeridos</p>
        </div>

        <div class="budget-card__amount">
          <span class="budget-card__currency">USD</span>
          <span class="budget-card__figure">${{ formatCurrency(budget.consolidatedRestockBudget) }}</span>
        </div>

        <div class="budget-card__footer">
          <div class="budget-card__stat">
            <i class="bi bi-box-seam me-1"></i>
            <span>{{ budget.itemsToPurchase?.length ?? 0 }} tipo(s) de insumo a comprar</span>
          </div>
          <div class="budget-card__stat">
            <i class="bi bi-layers me-1"></i>
            <span>{{ totalUnitsToPurchase }} unidades en total</span>
          </div>
        </div>
      </div>

      <div v-if="budget.itemsToPurchase && budget.itemsToPurchase.length > 0" class="card-surface p-0 overflow-hidden mt-4 mx-auto" style="max-width: 620px;">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="text-white py-3 ps-4 fw-700">Nombre del Insumo</th>
                <th class="text-white py-3 text-end fw-700">Unidades</th>
                <th class="text-white py-3 text-end fw-700 pe-4">Costo Estimado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in budget.itemsToPurchase" :key="item.id">
                <td class="ps-4 fw-semibold" style="color: var(--color-text-primary);">{{ item.supplyName }}</td>
                <td class="text-end fw-semibold">{{ item.unitsToOrder }}</td>
                <td class="text-end fw-semibold pe-4">${{ formatCurrency(item.estimatedCost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center py-5 px-3 card-surface mt-4 mx-auto" style="max-width: 620px;">
        <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-primary);">No se requieren compras</h5>
        <p class="text-muted mb-0">Todos los insumos tienen stock suficiente (mayor a 5 unidades).</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { blApi } from '@/services/http.js'

const budget = ref({})
const loading = ref(true)
const errorMessage = ref('')

const totalUnitsToPurchase = computed(() => {
  if (!budget.value.itemsToPurchase) return 0
  return budget.value.itemsToPurchase.reduce((sum, item) => sum + item.unitsToOrder, 0)
})

onMounted(fetchBudget)

async function fetchBudget() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await blApi.get('/fabuladental/supplies/restock-provisions')
    budget.value = response.data ?? {}
  } catch {
    errorMessage.value = 'No se pudo calcular el presupuesto de compra. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  if (value == null) return '0.00'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.budget-card {
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 620px;
  margin: 0 auto;
}

.budget-card__header {
  margin-bottom: 2rem;
}

.budget-card__icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(0, 82, 204, 0.08);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.2rem;
  color: var(--color-primary-start);
}

.budget-card__label {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}

.budget-card__sublabel {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.budget-card__amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.75rem;
  background: rgba(0, 82, 204, 0.04);
  border-radius: var(--border-radius-md);
  border: 1.5px solid rgba(0, 82, 204, 0.12);
}

.budget-card__currency {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary-end);
  letter-spacing: 0.08em;
}

.budget-card__figure {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--color-primary-start);
  line-height: 1;
}

.budget-card__footer {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.budget-card__stat {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}
</style>
