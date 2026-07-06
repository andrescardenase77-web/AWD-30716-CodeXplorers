<template>
  <div class="admin-view">
    <div class="mb-4">
      <h1>Análisis de Pérdidas</h1>
      <p class="admin-view__subtitle">Auditoría financiera del impacto económico por insumos caducados.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <span class="ms-3 text-secondary fw-semibold">Generando reporte de pérdidas...</span>
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-md-6">
        <div class="loss-card loss-card--primary">
          <div class="loss-card__icon-wrapper">
            <i class="bi bi-graph-down-arrow"></i>
          </div>
          <p class="loss-card__label">Pérdida Financiera Total</p>
          <p class="loss-card__value">${{ formatCurrency(lossReport.totalLossAmount) }}</p>
          <p class="loss-card__unit">USD</p>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="loss-card loss-card--secondary">
          <div class="loss-card__icon-wrapper">
            <i class="bi bi-box-seam"></i>
          </div>
          <p class="loss-card__label">Artículos Expirados</p>
          <p class="loss-card__value">{{ lossReport.expiredItemsCount ?? 0 }}</p>
          <p class="loss-card__unit">unidades registradas</p>
        </div>
      </div>

      <div class="col-12">
        <div class="card-surface p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="audit-badge">
              <i class="bi bi-shield-exclamation"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0" style="color: var(--color-danger);">Diagnóstico del Reporte</h5>
              <p class="mb-0" style="font-size: 0.85rem; color: var(--color-text-secondary);">
                Generado el {{ currentDate }}
              </p>
            </div>
          </div>
          <hr style="border-color: var(--color-border);" />
          <ul class="list-unstyled mb-0 audit-list">
            <li class="audit-list__item">
              <i class="bi bi-dot fs-4 text-danger"></i>
              Se identificó una pérdida de
              <strong style="color: var(--color-danger);">${{ formatCurrency(lossReport.totalLossAmount) }} USD</strong>
              causada por productos vencidos.
            </li>
            <li class="audit-list__item">
              <i class="bi bi-dot fs-4 text-danger"></i>
              Un total de <strong style="color: var(--color-danger);">{{ lossReport.expiredItemsCount ?? 0 }} artículo(s)</strong>
              caducados fueron identificados en el inventario.
            </li>
            <li class="audit-list__item">
              <i class="bi bi-dot fs-4 text-warning"></i>
              Se recomienda revisar el módulo de
              <RouterLink :to="{ name: 'expiration-alerts' }" style="color: var(--color-warning); font-weight: 700;">
                Alertas de Caducidad
              </RouterLink>
              para prevenir futuras pérdidas.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { blApi } from '@/services/http.js'

const lossReport = ref({})
const loading = ref(true)
const errorMessage = ref('')

const currentDate = new Date().toLocaleDateString('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

onMounted(fetchLossAnalysis)

async function fetchLossAnalysis() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await blApi.get('/fabuladental/supplies/expiration-losses')
    lossReport.value = response.data
  } catch {
    errorMessage.value = 'No se pudo generar el reporte de pérdidas. Por favor, intenta de nuevo.'
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
.loss-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  padding: 2.5rem 2rem;
  text-align: center;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.loss-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-elevated);
}

.loss-card--primary {
  border-top: 5px solid var(--color-danger);
}

.loss-card--secondary {
  border-top: 5px solid #c0392b;
}

.loss-card__icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(229, 62, 62, 0.10);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 2rem;
  color: var(--color-danger);
}

.loss-card__label {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.loss-card__value {
  font-size: 2.75rem;
  font-weight: 900;
  color: var(--color-danger);
  line-height: 1;
  margin-bottom: 0.3rem;
}

.loss-card__unit {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.audit-badge {
  width: 48px;
  height: 48px;
  background: rgba(229, 62, 62, 0.10);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: var(--color-danger);
  flex-shrink: 0;
}

.audit-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.audit-list__item {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  color: var(--color-text-secondary);
  gap: 0.25rem;
}
</style>
