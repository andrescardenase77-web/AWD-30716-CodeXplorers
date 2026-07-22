<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Panel de Control</h1>
      <p class="admin-view__subtitle">Resumen financiero del inventario de insumos de la clínica.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div class="row g-4">
      <div class="col-12 col-md-6">
        <div class="kpi-card kpi-card--success">
          <div v-if="loading" class="kpi-card__skeleton">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <template v-else>
            <div class="kpi-card__icon-wrapper kpi-card__icon-wrapper--success">
              <i class="bi bi-cash-stack fs-3"></i>
            </div>
            <div class="kpi-card__body">
              <p class="kpi-card__label">Valor Total del Inventario</p>
              <p class="kpi-card__value kpi-card__value--success">
                ${{ formatCurrency(assetValuation?.totalInventoryValue) }}
              </p>

            </div>
          </template>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="kpi-card kpi-card--warning">
          <div v-if="loading" class="kpi-card__skeleton">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <template v-else>
            <div class="kpi-card__icon-wrapper kpi-card__icon-wrapper--warning">
              <i class="bi bi-shield-exclamation fs-3"></i>
            </div>
            <div class="kpi-card__body">
              <p class="kpi-card__label">Capital en Riesgo</p>
              <p class="kpi-card__value kpi-card__value--warning">
                ${{ formatCurrency(capitalRisk?.capitalAtRisk) }}
              </p>
              <p class="kpi-card__subtext">
                {{ capitalRisk?.itemsAtRisk ?? 0 }} artículo(s) próximos a caducar o expirados
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-1">
      <div class="col-12">
        <div class="card-surface p-4">
          <h5 class="fw-bold mb-1" style="color: var(--color-text-primary);">Accesos Rápidos</h5>
          <p class="admin-view__subtitle mb-3">Navega directamente a los módulos de análisis.</p>
          <div class="d-flex flex-wrap gap-2">
            <RouterLink :to="{ name: 'qr-generator' }" class="btn btn-outline-primary btn-sm fw-semibold">
              <i class="bi bi-qr-code-scan me-1"></i> Generador de Códigos QR
            </RouterLink>
            <RouterLink :to="{ name: 'restock-budget' }" class="btn btn-outline-primary btn-sm fw-semibold">
              <i class="bi bi-wallet2 me-1"></i> Presupuesto de Compra
            </RouterLink>
            <RouterLink :to="{ name: 'expiration-alerts' }" class="btn btn-outline-warning btn-sm fw-semibold">
              <i class="bi bi-clock-history me-1"></i> Alertas de Caducidad
            </RouterLink>
            <RouterLink :to="{ name: 'expired-history' }" class="btn btn-outline-danger btn-sm fw-semibold">
              <i class="bi bi-x-circle me-1"></i> Historial de Expirados
            </RouterLink>
            <RouterLink :to="{ name: 'loss-analysis' }" class="btn btn-outline-danger btn-sm fw-semibold">
              <i class="bi bi-graph-down-arrow me-1"></i> Análisis de Pérdidas
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { blApi } from '@/services/http.js'

const loading = ref(true)
const errorMessage = ref('')
const assetValuation = ref({})
const capitalRisk = ref({})

onMounted(fetchDashboardData)

async function fetchDashboardData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [valuationResponse, riskResponse] = await Promise.all([
      blApi.get('/fabuladental/supplies/asset-valuations'),
      blApi.get('/fabuladental/supplies/capital-risks')
    ])
    assetValuation.value = {
      totalInventoryValue: valuationResponse.data?.totalInventoryValue,
      totalItems: valuationResponse.data?.totalItems
    }
    capitalRisk.value = {
      capitalAtRisk: riskResponse.data?.totalCapitalAtRisk,
      itemsAtRisk: riskResponse.data?.itemsNearExpirationCount
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudo cargar la información del panel. Por favor, intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  if (value == null || isNaN(Number(value))) return '0.00'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.kpi-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  min-height: 150px;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-elevated);
}

.kpi-card--success {
  border-left: 5px solid var(--color-success);
}

.kpi-card--warning {
  border-left: 5px solid var(--color-warning);
}

.kpi-card__skeleton {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-card__icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card__icon-wrapper--success {
  background: rgba(56, 161, 105, 0.12);
  color: var(--color-success);
}

.kpi-card__icon-wrapper--warning {
  background: rgba(214, 158, 46, 0.12);
  color: var(--color-warning);
}

.kpi-card__body {
  flex: 1;
}

.kpi-card__label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  margin-bottom: 0.4rem;
}

.kpi-card__value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 0.4rem;
}

.kpi-card__value--success {
  color: var(--color-success);
}

.kpi-card__value--warning {
  color: var(--color-warning);
}

.kpi-card__subtext {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
