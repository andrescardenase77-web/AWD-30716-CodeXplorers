<template>
  <div class="admin-view no-print">
    <div class="mb-4">
      <h1>Generador de Etiquetas QR</h1>
      <p class="admin-view__subtitle">Genera e imprime códigos QR para identificar físicamente los insumos en tu almacén.</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
    </div>

    <div class="row g-4">
      <!-- Selector Card -->
      <div class="col-12 col-md-5">
        <div class="card-surface p-4">
          <h5 class="fw-bold mb-3" style="color: var(--color-text-primary);">Seleccionar Insumo</h5>
          
          <div v-if="loadingSupplies" class="d-flex align-items-center gap-2 py-3">
            <span class="spinner-ring" style="border-top-color: var(--color-primary-start);"></span>
            <span class="text-secondary small fw-semibold">Cargando catálogo...</span>
          </div>

          <div v-else class="form-group">
            <label class="form-label-styled">Buscar y Seleccionar Insumo</label>
            <div class="input-group mb-2">
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
            
            <div v-if="filteredSupplies.length > 0" class="list-group shadow-sm" style="max-height: 200px; overflow-y: auto;">
              <button 
                v-for="supply in filteredSupplies" 
                :key="supply.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                :class="{ 'active': selectedSupplyId === supply.id }"
                @click="selectSupply(supply.id)"
              >
                <span>{{ supply.supplyName }}</span>
                <span class="badge bg-primary rounded-pill">{{ supply.quantity }}</span>
              </button>
            </div>
            <div v-else class="text-muted small mt-2">
              No se encontraron insumos.
            </div>
          </div>

          <div v-if="selectedSupply" class="mt-4 pt-3 border-top">
            <h6 class="fw-bold text-secondary mb-3">Detalles Rápidos</h6>
            <ul class="list-unstyled d-flex flex-column gap-2 small">
              <li class="d-flex justify-content-between">
                <span class="text-muted">Cantidad:</span>
                <span class="fw-bold">{{ selectedSupply.quantity }} unidades</span>
              </li>
              <li class="d-flex justify-content-between">
                <span class="text-muted">Costo Unitario:</span>
                <span class="fw-bold">${{ formatCurrency(selectedSupply.unitCost) }}</span>
              </li>
              <li class="d-flex justify-content-between">
                <span class="text-muted">Vencimiento:</span>
                <span class="fw-bold" :class="getExpiryTextClass(selectedSupply.status)">
                  {{ formatDate(selectedSupply.expirationDate) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Preview Label Card -->
      <div class="col-12 col-md-7">
        <div class="card-surface p-4 text-center d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
          <div v-if="!selectedSupply" class="text-muted py-5">
            <i class="bi bi-qr-code" style="font-size: 4rem; opacity: 0.3;"></i>
            <p class="mt-3 mb-0 fw-semibold">Elige un insumo de la lista para previsualizar la etiqueta QR.</p>
          </div>

          <template v-else>
            <h5 class="fw-bold mb-4 w-100 text-start" style="color: var(--color-text-primary);">Previsualización de Etiqueta</h5>
            
            <!-- Printable Label -->
            <div class="print-area label-card card shadow-sm p-4 mb-4 border border-secondary border-opacity-25" style="max-width: 360px; width: 100%;">
              <div class="label-header pb-3 mb-3 border-bottom d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-tooth text-primary fs-4"></i>
                <span class="fw-bold text-dark fs-6 uppercase tracking-wider">Fábula Dental</span>
              </div>

              <!-- QR Code Image -->
              <div class="qr-container mb-3 d-flex justify-content-center align-items-center">
                <img :src="qrCodeUrl" alt="Código QR de Insumo" class="img-fluid border p-2 bg-white" style="width: 180px; height: 180px;" />
              </div>

              <div class="label-details text-center">
                <h4 class="fw-bolder text-dark mb-1 supply-title">{{ selectedSupply.supplyName }}</h4>
                <p class="text-muted small mb-2">ID Registro: #{{ selectedSupply.id }}</p>
              </div>
            </div>

            <!-- Print Actions -->
            <div class="d-flex gap-2">
              <button @click="printLabel" class="btn btn-primary-gradient px-4">
                <i class="bi bi-printer"></i> Imprimir Etiqueta
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Print-only view structure to prevent extra margins in native print -->
  <div class="print-only-layout d-none">
    <div v-if="selectedSupply" class="label-card card p-4 border border-dark border-opacity-75" style="width: 100%; max-width: 320px; margin: 0 auto; text-align: center;">
      <div class="label-header pb-2 mb-2 border-bottom d-flex align-items-center justify-content-center gap-1">
        <i class="bi bi-tooth fs-5" style="color: #000 !important;"></i>
        <span class="fw-bold fs-6" style="color: #000 !important; text-transform: uppercase; letter-spacing: 0.05em;">Fábula Dental</span>
      </div>
      <div class="qr-container mb-2 text-center">
        <img :src="qrCodeUrl" alt="Código QR de Insumo" style="width: 160px; height: 160px; border: 1px solid #000; padding: 4px;" />
      </div>
      <div class="label-details">
        <h4 class="fw-bolder mb-1" style="font-size: 1.15rem; color: #000 !important; margin: 0;">{{ selectedSupply.supplyName }}</h4>
        <p class="small mb-1" style="font-size: 0.75rem; color: #666 !important; margin: 0;">ID: #{{ selectedSupply.id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { crudApi } from '@/services/http.js'
import { fromEvent, map, debounceTime, distinctUntilChanged } from 'rxjs'

const route = useRoute()
const supplies = ref([])
const loadingSupplies = ref(true)
const errorMessage = ref('')
const selectedSupplyId = ref('')
const selectedSupply = ref(null)

const searchQuery = ref('')
const debouncedQuery = ref('')
const searchInputRef = ref(null)
let searchSubscription = null

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
  loadingSupplies.value = true
  errorMessage.value = ''
  try {
    const response = await crudApi.get('/fabuladental/supplies')
    supplies.value = response.data || []
    
    // Check if supplyId was passed via route query
    if (route.query.supplyId) {
      const idStr = route.query.supplyId.toString()
      const found = supplies.value.find(s => s.id.toString() === idStr)
      if (found) {
        selectSupply(found.id)
        searchQuery.value = found.supplyName
        debouncedQuery.value = found.supplyName
      }
    }
  } catch {
    errorMessage.value = 'No se pudo cargar el catálogo de insumos. Por favor, intenta de nuevo.'
  } finally {
    loadingSupplies.value = false
  }
}

function selectSupply(id) {
  selectedSupplyId.value = id
  selectedSupply.value = supplies.value.find((s) => s.id === id) || null
}

const publicRedirectUrl = computed(() => {
  if (!selectedSupply.value) return ''
  return `https://fabuladental-front.duckdns.org/public/supply/${selectedSupply.value.id}`
})

const qrCodeUrl = computed(() => {
  if (!publicRedirectUrl.value) return ''
  // Consume public QR Code Generator API
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicRedirectUrl.value)}`
})

function printLabel() {
  const printContent = document.querySelector('.print-only-layout').innerHTML
  
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <html>
      <head>
        <title>Etiqueta QR</title>
        <style>
          @page { margin: 0; size: auto; }
          body { 
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 1cm;
            display: flex;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `)
  doc.close()
  
  // Wait for the QR code image inside the iframe to load before printing
  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 250)
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

function getExpiryTextClass(status) {
  if (status === 'Expired') return 'text-danger fw-bold'
  if (status === 'NextExpiration') return 'text-warning fw-bold'
  return 'text-success fw-bold'
}
</script>

<style scoped>
.qr-container {
  min-height: 180px;
}

.label-card {
  background: #ffffff;
  border-radius: var(--border-radius-md);
  margin-left: auto;
  margin-right: auto;
}

.supply-title {
  font-size: 1.4rem;
  letter-spacing: -0.01em;
}

/* Scoped print styling */
@media print {
  /* Hide the rest of the application layout */
  .no-print,
  :deep(.admin-navbar),
  :deep(.admin-sidebar),
  :deep(.admin-view) {
    display: none !important;
  }

  .print-only-layout {
    display: block !important;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 320px;
    padding: 0;
    margin: 0;
  }
}
</style>
