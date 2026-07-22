<template>
  <div class="page-center px-3 py-5">
    <div class="card-surface p-4 p-md-5 text-center shadow-lg border-0 container-card" style="width: 100%; max-width: 480px;">
      <!-- Header -->
      <div class="d-flex flex-column align-items-center gap-2 mb-4">
        <div class="icon-circle gradient-header mb-2">
          <i class="bi bi-tooth text-white fs-3"></i>
        </div>
        <span class="fs-4 fw-extrabold text-gradient">Fábula Dental</span>
        <p class="text-secondary small m-0 uppercase tracking-wider">Verificación de Insumo</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-5">
        <span class="spinner-ring" style="width: 32px; height: 32px; border-width: 3px; border-top-color: var(--color-primary-start);"></span>
        <p class="text-muted mt-3 fw-semibold">Buscando registro en la base de datos...</p>
      </div>

      <!-- Error State (e.g. Supply not found) -->
      <div v-else-if="!supply" class="py-4">
        <i class="bi bi-exclamation-octagon-fill text-danger" style="font-size: 3.5rem;"></i>
        <h4 class="fw-bold text-dark mt-3">Registro no encontrado</h4>
        <p class="text-secondary small mt-2 px-3">El código QR escaneado no corresponde a ningún insumo activo en el inventario actual.</p>
        <RouterLink :to="{ name: 'landing' }" class="btn btn-outline-secondary mt-3 px-4">
          Volver al Inicio
        </RouterLink>
      </div>

      <!-- Content State -->
      <template v-else>
        <!-- Title and Status -->
        <div class="mb-4">
          <h2 class="fw-black text-dark mb-2">{{ supply.supplyName }}</h2>
          <span :class="getStatusBadgeClass(supply.status)" class="badge fs-6 px-4 py-2 border shadow-sm">
            {{ getStatusLabel(supply.status) }}
          </span>
        </div>

        <!-- Expiration Alert Notice -->
        <div v-if="supply.status === 'Expired'" class="alert alert-danger-custom text-start mb-4 p-3 small d-flex gap-2 align-items-center">
          <i class="bi bi-shield-x fs-4"></i>
          <div>
            <strong>¡Atención Insumo Caducado!</strong><br />
            Este lote ha expirado y debe ser descartado o retirado inmediatamente del uso clínico.
          </div>
        </div>
        <div v-else-if="supply.status === 'NextExpiration'" class="alert alert-warning-custom text-start mb-4 p-3 small d-flex gap-2 align-items-center">
          <i class="bi bi-clock-history fs-4"></i>
          <div>
            <strong>¡Vencimiento Cercano!</strong><br />
            Este insumo expira en menos de 30 días. Utilícelo con prioridad.
          </div>
        </div>

        <!-- Details Table -->
        <div class="details-table mb-4 p-3 bg-light rounded border text-start">
          <div class="row py-2 border-bottom">
            <div class="col-5 text-muted small fw-semibold">ID Registro</div>
            <div class="col-7 text-dark fw-bold text-end">#{{ supply.id }}</div>
          </div>
          <div class="row py-2 border-bottom">
            <div class="col-5 text-muted small fw-semibold">Stock en Bodega</div>
            <div class="col-7 text-dark fw-bold text-end">{{ supply.quantity }} unidades</div>
          </div>
          <div class="row py-2 border-bottom">
            <div class="col-5 text-muted small fw-semibold">Costo Unitario</div>
            <div class="col-7 text-dark fw-bold text-end">${{ formatCurrency(supply.unitCost) }}</div>
          </div>
          <div class="row py-2 border-bottom">
            <div class="col-5 text-muted small fw-semibold">Fecha Registro</div>
            <div class="col-7 text-dark fw-bold text-end">{{ formatDate(supply.orderDate) }}</div>
          </div>
          <div class="row py-2">
            <div class="col-5 text-muted small fw-semibold">Fecha Caducidad</div>
            <div class="col-7 text-dark fw-bold text-end">{{ formatDate(supply.expirationDate) }}</div>
          </div>
        </div>

        <!-- Action Links -->
        <div class="d-flex flex-column gap-2">
          <RouterLink :to="{ name: 'login' }" class="btn-primary-gradient w-100 justify-content-center py-2" id="login-admin-btn">
            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión para Administrar
          </RouterLink>
          <RouterLink :to="{ name: 'landing' }" class="text-secondary small hover-primary mt-2">
            Volver a la página de inicio
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { crudApi } from '@/services/http.js'

const route = useRoute()
const supply = ref(null)
const loading = ref(true)

onMounted(fetchSupplyDetails)

async function fetchSupplyDetails() {
  loading.value = true
  try {
    const response = await crudApi.get('/fabuladental/supplies')
    const supplyId = route.params.id
    
    // Find the item matching the route parameter ID (support type coercion between string and BigInt)
    supply.value = response.data.find(
      (item) => item.id.toString() === supplyId.toString()
    ) || null
  } catch (error) {
    console.error('Error loading supply:', error)
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  if (value == null) return '0.00'
  return Number(value).toFixed(2)
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getStatusLabel(status) {
  const map = {
    Current: 'Vigente',
    NextExpiration: 'Por Vencer',
    Expired: 'Caducado'
  }
  return map[status] ?? status
}

function getStatusBadgeClass(status) {
  const map = {
    Current: 'bg-success border-success text-white',
    NextExpiration: 'bg-warning border-warning text-dark',
    Expired: 'bg-danger border-danger text-white'
  }
  return map[status] ?? 'bg-secondary border-secondary text-white'
}
</script>

<style scoped>
.container-card {
  border-radius: var(--border-radius-lg) !important;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 82, 204, 0.18);
}

.fw-extrabold {
  font-weight: 800;
}

.fw-black {
  font-weight: 900;
}

.alert-danger-custom {
  background: #fff5f5;
  border: 1.5px solid #fed7d7;
  color: var(--color-danger);
  border-radius: var(--border-radius-sm);
}

.alert-warning-custom {
  background: #fffaf0;
  border: 1.5px solid #feebc8;
  color: var(--color-warning);
  border-radius: var(--border-radius-sm);
}

.details-table .row {
  margin: 0;
}

.hover-primary {
  transition: color var(--transition-base);
}

.hover-primary:hover {
  color: var(--color-primary-start) !important;
}
</style>
