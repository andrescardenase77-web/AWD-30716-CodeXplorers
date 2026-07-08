<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>Gestión de Pagos</h1>
        <p class="admin-view__subtitle">Control financiero, arqueo diario y reportes de cobranza.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button @click="openCashRegisterModal" class="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm bg-white">
          <i class="bi bi-lock-fill text-primary"></i> Cierre de Caja
        </button>
        <button @click="exportToCSV" class="btn btn-outline-success d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm bg-white" :disabled="filteredPayments.length === 0">
          <i class="bi bi-file-earmark-excel-fill text-success"></i> Exportar CSV
        </button>
        <RouterLink :to="{ name: 'payment-register' }" class="btn btn-primary-gradient d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold rounded-3 shadow-sm flex-shrink-0">
          <i class="bi bi-plus-lg"></i> Registrar Pago
        </RouterLink>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 kpi-card border-start border-4 border-primary">
          <div class="kpi-icon bg-primary bg-opacity-10 text-primary">
            <i class="bi bi-currency-dollar fs-3"></i>
          </div>
          <div>
            <span class="text-muted fs-7 fw-bold text-uppercase d-block">Ingresos de Hoy</span>
            <h3 class="fw-black mb-0 text-dark">${{ formatCurrency(todayRevenue) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 kpi-card border-start border-4 border-success">
          <div class="kpi-icon bg-success bg-opacity-10 text-success">
            <i class="bi bi-calendar-check fs-3"></i>
          </div>
          <div>
            <span class="text-muted fs-7 fw-bold text-uppercase d-block">Recaudación del Mes</span>
            <h3 class="fw-black mb-0 text-dark">${{ formatCurrency(monthRevenue) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 kpi-card border-start border-4 border-warning">
          <div class="kpi-icon bg-warning bg-opacity-10 text-warning-emphasis">
            <i class="bi bi-clock-history fs-3"></i>
          </div>
          <div>
            <span class="text-muted fs-7 fw-bold text-uppercase d-block">Depósitos / Parciales</span>
            <h3 class="fw-black mb-0 text-dark">{{ pendingDepositsCount }} <span class="fs-6 fw-normal text-muted">pacientes</span></h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 kpi-card border-start border-4 border-info">
          <div class="kpi-icon bg-info bg-opacity-10 text-info-emphasis">
            <i class="bi bi-credit-card-2-front fs-3"></i>
          </div>
          <div>
            <span class="text-muted fs-7 fw-bold text-uppercase d-block">Método Favorito</span>
            <h3 class="fw-black mb-0 text-dark fs-5">{{ topPaymentMethod }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success alert-dismissible d-flex align-items-center mb-4 shadow-sm" role="alert">
      <i class="bi bi-check-circle-fill me-2 fs-5"></i>
      {{ successMessage }}
      <button type="button" class="btn-close ms-auto" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
      {{ errorMessage }}
    </div>

    <div class="card-surface p-3 mb-4 bg-white shadow-sm">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4 col-xl-3">
          <label class="form-label-styled fs-7 mb-1">Buscar Paciente</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              class="form-control border-start-0 bg-light"
              placeholder="Cédula de 10 dígitos..."
            />
          </div>
        </div>
        <div class="col-6 col-md-3 col-xl-2">
          <label class="form-label-styled fs-7 mb-1">Período</label>
          <select v-model="filterDateRange" class="form-select bg-light fw-semibold">
            <option value="all">Todo el historial</option>
            <option value="today">Hoy</option>
            <option value="month">Este Mes</option>
            <option value="custom">Rango Personalizado</option>
          </select>
        </div>
        <div v-if="filterDateRange === 'custom'" class="col-6 col-md-3 col-xl-2">
          <label class="form-label-styled fs-7 mb-1">Desde</label>
          <input type="date" v-model="customStartDate" class="form-control bg-light" />
        </div>
        <div v-if="filterDateRange === 'custom'" class="col-6 col-md-3 col-xl-2">
          <label class="form-label-styled fs-7 mb-1">Hasta</label>
          <input type="date" v-model="customEndDate" class="form-control bg-light" />
        </div>
        <div class="col-6 col-md-3 col-xl-2">
          <label class="form-label-styled fs-7 mb-1">Método de Pago</label>
          <select v-model="filterMethod" class="form-select bg-light fw-semibold">
            <option value="all">Todos los métodos</option>
            <option value="Cash">💵 Efectivo</option>
            <option value="Card">💳 Tarjeta</option>
            <option value="Transfer">🏦 Transferencia</option>
          </select>
        </div>
        <div class="col-6 col-md-3 col-xl-2">
          <label class="form-label-styled fs-7 mb-1">Tipo de Cobro</label>
          <select v-model="filterType" class="form-select bg-light fw-semibold">
            <option value="all">Todos los tipos</option>
            <option value="Final">✅ Final (Completo)</option>
            <option value="Deposit">⏳ Depósito (Anticipo)</option>
          </select>
        </div>
        <div class="col-12 col-xl-1 d-flex justify-content-end">
          <button v-if="hasActiveFilters" @click="resetFilters" class="btn btn-light w-100 text-muted" title="Limpiar Filtros">
            <i class="bi bi-arrow-counterclockwise"></i> Limpiar
          </button>
        </div>
      </div>
    </div>

    <div class="card-surface p-0 overflow-hidden shadow-sm">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Cargando transacciones de la clínica...</span>
      </div>

      <div v-else-if="filteredPayments.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-wallet2" style="font-size: 3.5rem; color: var(--color-border);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-secondary);">No se encontraron pagos</h5>
        <p class="text-muted">No hay transacciones que coincidan con los filtros seleccionados o la lista está vacía.</p>
        <button v-if="hasActiveFilters" @click="resetFilters" class="btn btn-outline-primary mt-2">
          <i class="bi bi-funnel"></i> Quitar filtros
        </button>
        <RouterLink v-else :to="{ name: 'payment-register' }" class="btn btn-primary-gradient d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold rounded-3 shadow-sm mt-3">
          <i class="bi bi-plus-lg"></i> Registrar Primer Pago
        </RouterLink>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead style="background-color: var(--color-background); border-bottom: 2px solid var(--color-border);">
            <tr>
              <th class="py-3 px-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Comprobante</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Cédula Paciente</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Detalle de Pago</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Monto ($)</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Fecha</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Estado</th>
              <th class="py-3 text-center fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px; color: var(--color-text-secondary); border-bottom: none;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id" class="transition-base">
              <td class="text-center px-3">
                <span class="badge bg-light text-secondary border font-monospace px-2 py-1 fs-7">#FD-{{ String(payment.id).padStart(4, '0') }}</span>
              </td>
              <td class="text-center fw-bold" style="color: var(--color-text-primary);">{{ payment.patientID }}</td>
              <td class="text-center">
                <div class="d-inline-flex align-items-center gap-2">
                  <span :class="getMethodIconClass(payment.paymentMethod)">
                    <i :class="getMethodIcon(payment.paymentMethod)"></i>
                  </span>
                  <span class="fw-semibold">{{ getPaymentDetails(payment) }}</span>
                </div>
              </td>
              <td class="text-center">
                <span class="fw-black fs-6 text-dark">${{ formatCurrency(payment.amount) }}</span>
              </td>
              <td class="text-center text-muted fs-7 fw-semibold">{{ formatDate(payment.date) }}</td>
              <td class="text-center">
                <span :class="getStatusBadgeClass(payment.status)" class="badge fs-7 py-2 px-3 rounded-pill fw-bold d-inline-flex justify-content-center align-items-center">
                  <i :class="payment.status === 'Completed' ? 'bi bi-check-circle-fill me-1' : 'bi bi-clock-fill me-1'"></i>
                  {{ payment.status === 'Completed' ? 'Completado' : (payment.status === 'Partial' ? 'Parcial' : payment.status) }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button
                    class="btn btn-sm btn-light border text-primary fw-semibold d-inline-flex align-items-center gap-1"
                    @click="openReceiptModal(payment)"
                    title="Imprimir Recibo"
                  >
                    <i class="bi bi-receipt"></i>
                    <span class="d-none d-xl-inline">Recibo</span>
                  </button>
                  <button
                    class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                    @click="openEditModal(payment)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                    @click="deletePayment(payment)"
                    title="Eliminar"
                  >
                    <span v-if="deletingId === payment.id" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-trash3"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showReceiptModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg print-area" style="border-radius: 20px; overflow: hidden;">
          <div class="p-4 text-center text-white gradient-header">
            <div class="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-25 rounded-circle p-3 mb-2">
              <i class="bi bi-tooth fs-1 text-white"></i>
            </div>
            <h3 class="fw-black m-0 letter-spacing">FÁBULA DENTAL</h3>
            <p class="fs-7 m-0 opacity-75">Clínica Odontológica Especializada</p>
            <div class="mt-3 badge bg-white text-primary fw-bold px-3 py-1 fs-6 shadow-sm">
              RECIBO DE CAJA #FD-{{ String(selectedPaymentForReceipt?.id).padStart(4, '0') }}
            </div>
          </div>

          <div class="p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
              <span class="text-muted fs-7">Fecha de Emisión:</span>
              <span class="fw-bold fs-7">{{ formatDate(selectedPaymentForReceipt?.date) }}</span>
            </div>

            <div class="mb-4">
              <div class="row g-2 mb-2">
                <div class="col-5 text-muted fs-7">Cédula Paciente:</div>
                <div class="col-7 fw-bold text-end">{{ selectedPaymentForReceipt?.patientID }}</div>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-5 text-muted fs-7">Tipo de Transacción:</div>
                <div class="col-7 fw-bold text-end">
                  <span :class="selectedPaymentForReceipt?.paymentType === 'Deposit' ? 'text-warning-emphasis' : 'text-success'">
                    {{ selectedPaymentForReceipt?.paymentType === 'Deposit' ? '⏳ Depósito (Anticipo)' : '✅ Pago Final (Completo)' }}
                  </span>
                </div>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-5 text-muted fs-7">Método de Pago:</div>
                <div class="col-7 fw-bold text-end">
                  {{ selectedPaymentForReceipt?.paymentMethod === 'Cash' ? '💵 Efectivo' : (selectedPaymentForReceipt?.paymentMethod === 'Card' ? '💳 Tarjeta de Crédito/Débito' : '🏦 Transferencia Bancaria') }}
                </div>
              </div>
              <div class="row g-2">
                <div class="col-5 text-muted fs-7">Estado en Sistema:</div>
                <div class="col-7 fw-bold text-end">{{ selectedPaymentForReceipt?.status === 'Completed' ? 'Completado / Pagado' : 'Pendiente / Parcial' }}</div>
              </div>
            </div>

            <div class="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center mb-4 border">
              <span class="fw-bold text-secondary text-uppercase fs-7">Total Recibido:</span>
              <span class="fs-3 fw-black text-primary">${{ formatCurrency(selectedPaymentForReceipt?.amount) }}</span>
            </div>

            <div class="text-center pt-3 border-top">
              <p class="fs-7 text-muted mb-1">Atendido por: <strong>Departamento de Recepción y Caja</strong></p>
              <p class="fs-8 text-secondary m-0">¡Gracias por confiar su sonrisa en Fábula Dental!</p>
              <div class="font-monospace text-muted mt-2" style="font-size: 0.65rem; letter-spacing: 2px;">
                |||||||||||||| FD-{{ selectedPaymentForReceipt?.patientID }}-{{ selectedPaymentForReceipt?.id }} ||||||||||||||
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 justify-content-between no-print">
            <button type="button" class="btn btn-outline-secondary px-4 fw-semibold" @click="closeReceiptModal">Cerrar</button>
            <button type="button" class="btn btn-primary-gradient px-4 fw-semibold" @click="printReceipt">
              <i class="bi bi-printer-fill me-2"></i> Imprimir Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCashRegisterModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg print-area" style="border-radius: 20px; overflow: hidden;">
          <div class="modal-header gradient-header text-white p-4 border-0">
            <div>
              <h4 class="fw-bold m-0 d-flex align-items-center gap-2">
                <i class="bi bi-lock-fill"></i> Arqueo y Cierre de Caja del Día
              </h4>
              <p class="fs-7 m-0 opacity-75 mt-1">Resumen oficial de recaudación del turno de Recepción</p>
            </div>
            <button type="button" class="btn-close btn-close-white no-print" @click="closeCashRegisterModal"></button>
          </div>

          <div class="modal-body p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
              <div>
                <span class="text-muted fs-7 d-block">Fecha de Arqueo:</span>
                <span class="fw-bold fs-6 text-dark">{{ formatDate(getTodayDate()) }}</span>
              </div>
              <div class="text-end">
                <span class="text-muted fs-7 d-block">Total Operaciones Hoy:</span>
                <span class="badge bg-primary fs-6 px-3 py-1">{{ cashRegisterSummary.count }} cobros</span>
              </div>
            </div>

            <h6 class="fw-bold text-secondary text-uppercase fs-7 mb-3">Desglose por Medio de Pago</h6>
            
            <div class="row g-3 mb-4">
              <div class="col-12 col-md-4">
                <div class="p-3 bg-light rounded-3 border text-center">
                  <div class="text-success mb-1 fs-4"><i class="bi bi-cash-stack"></i></div>
                  <span class="text-muted fs-7 fw-bold d-block">Efectivo en Caja</span>
                  <h4 class="fw-black text-dark mb-0">${{ formatCurrency(cashRegisterSummary.cash) }}</h4>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-3 bg-light rounded-3 border text-center">
                  <div class="text-info mb-1 fs-4"><i class="bi bi-credit-card-fill"></i></div>
                  <span class="text-muted fs-7 fw-bold d-block">Terminal de Tarjetas</span>
                  <h4 class="fw-black text-dark mb-0">${{ formatCurrency(cashRegisterSummary.card) }}</h4>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-3 bg-light rounded-3 border text-center">
                  <div class="text-secondary mb-1 fs-4"><i class="bi bi-bank2"></i></div>
                  <span class="text-muted fs-7 fw-bold d-block">Transferencias Bancarias</span>
                  <h4 class="fw-black text-dark mb-0">${{ formatCurrency(cashRegisterSummary.transfer) }}</h4>
                </div>
              </div>
            </div>

            <div class="p-4 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25 d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-black text-primary m-0">TOTAL RECAUDADO EN CAJA</h5>
                <span class="fs-7 text-muted">Suma general verificada por el sistema</span>
              </div>
              <span class="fs-2 fw-black text-primary">${{ formatCurrency(cashRegisterSummary.total) }}</span>
            </div>

            <div class="alert alert-warning d-flex align-items-center gap-2 fs-7 m-0">
              <i class="bi bi-exclamation-circle-fill text-warning fs-5"></i>
              <span>Al confirmar el arqueo, el recepcionista certifica que los montos físicos y bancarios coinciden con este reporte.</span>
            </div>
          </div>

          <div class="modal-footer bg-light border-0 px-4 py-3 justify-content-between no-print">
            <button type="button" class="btn btn-outline-secondary px-4 fw-semibold" @click="closeCashRegisterModal">Cerrar</button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-primary px-4 fw-semibold" @click="printCashRegister">
                <i class="bi bi-printer me-1"></i> Imprimir Arqueo
              </button>
              <button type="button" class="btn btn-success px-4 fw-semibold text-white shadow-sm" @click="confirmCashRegister">
                <i class="bi bi-check-circle-fill me-1"></i> Confirmar y Cerrar Turno
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content card-surface border-0 p-3 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold m-0" style="color: var(--color-text-primary);">Editar Pago</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePayment">
              <div class="mb-3">
                <label class="form-label-styled">Cédula del Paciente</label>
                <input type="text" v-model="editForm.patientID" class="form-input-styled" :class="{ 'input-error': editErrors.patientID }" required />
                <p v-if="editErrors.patientID" class="field-error-msg mt-1">{{ editErrors.patientID }}</p>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-sm-6">
                  <label class="form-label-styled">Tipo de Pago</label>
                  <select
                    v-model="editForm.paymentType"
                    class="form-select form-input-styled"
                    :class="[
                      editForm.paymentType === 'Deposit' ? 'text-warning-emphasis bg-warning bg-opacity-10 fw-semibold border-warning border-opacity-50' : '',
                      editForm.paymentType === 'Final' ? 'text-success bg-success bg-opacity-10 fw-semibold border-success border-opacity-50' : ''
                    ]"
                    required
                  >
                    <option value="Deposit" class="fw-semibold" style="background-color: #fff3cd; color: #664d03;">Depósito (Parcial)</option>
                    <option value="Final" class="fw-semibold" style="background-color: #d1e7dd; color: #0f5132;">Final (Completo)</option>
                  </select>
                </div>
                <div class="col-sm-6">
                  <label class="form-label-styled">Método</label>
                  <select
                    v-model="editForm.paymentMethod"
                    class="form-select form-input-styled"
                    :class="[
                      editForm.paymentMethod === 'Cash' ? 'text-primary-emphasis bg-primary bg-opacity-10 fw-semibold border-primary border-opacity-50' : '',
                      editForm.paymentMethod === 'Card' ? 'text-info-emphasis bg-info bg-opacity-10 fw-semibold border-info border-opacity-50' : '',
                      editForm.paymentMethod === 'Transfer' ? 'text-dark bg-dark bg-opacity-10 fw-semibold border-dark border-opacity-50' : ''
                    ]"
                    required
                  >
                    <option value="Cash" class="fw-semibold" style="background-color: #cfe2ff; color: #084298;">Efectivo</option>
                    <option value="Card" class="fw-semibold" style="background-color: #cff4fc; color: #055160;">Tarjeta</option>
                    <option value="Transfer" class="fw-semibold" style="background-color: #e2e3e5; color: #41464b;">Transferencia</option>
                  </select>
                </div>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-sm-12">
                  <label class="form-label-styled">Monto ($)</label>
                  <input type="number" step="0.01" min="0" v-model.number="editForm.amount" class="form-input-styled" :class="{ 'input-error': editErrors.amount }" required />
                  <p v-if="editErrors.amount" class="field-error-msg mt-1">{{ editErrors.amount }}</p>
                </div>
              </div>
              <div class="mb-4">
                <label class="form-label-styled">Fecha de Pago</label>
                <input type="date" v-model="editForm.date" class="form-input-styled" :class="{ 'input-error': editErrors.date }" required />
                <p v-if="editErrors.date" class="field-error-msg mt-1">{{ editErrors.date }}</p>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancelar</button>
                <button type="submit" class="btn-primary-gradient border-0 px-4" :disabled="saving">
                  <span v-if="saving" class="spinner-ring me-1"></span>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 p-4 shadow-lg" style="border-radius: 16px;">
          <div class="modal-body text-center p-0">
            <div class="mb-4 mt-2">
              <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle" style="width: 80px; height: 80px;">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 2.5rem;"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-3" style="color: var(--color-text-primary);">¿Eliminar Pago?</h4>
            <p class="text-muted mb-4 fs-6">
              Estás a punto de eliminar el pago asociado a la cédula <strong class="text-dark">{{ paymentToDelete?.patientID }}</strong>. <br/> Esta acción no se puede deshacer.
            </p>
            <div class="d-flex gap-3 justify-content-center mt-2">
              <button type="button" class="btn btn-light px-4 py-2 fw-semibold" @click="closeDeleteModal" style="border-radius: 8px; color: var(--color-text-secondary); background: var(--color-background);">Cancelar</button>
              <button type="button" class="btn btn-danger px-4 py-2 fw-semibold" @click="confirmDelete" :disabled="deletingId !== null" style="border-radius: 8px;">
                <span v-if="deletingId !== null" class="spinner-border spinner-border-sm me-2"></span>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { blApi } from '@/services/http'

const payments = ref([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const searchQuery = ref('')

const filterDateRange = ref('all')
const customStartDate = ref('')
const customEndDate = ref('')
const filterMethod = ref('all')
const filterType = ref('all')

const showEditModal = ref(false)
const editForm = ref({})
const editErrors = ref({})
const saving = ref(false)
const deletingId = ref(null)

const showDeleteModal = ref(false)
const paymentToDelete = ref(null)

const showReceiptModal = ref(false)
const selectedPaymentForReceipt = ref(null)

const showCashRegisterModal = ref(false)

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchPayments = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await blApi.get('/fabuladental/payments')
    payments.value = response.data.payments || response.data || []
  } catch (error) {
    console.error('Error fetching payments:', error)
    errorMessage.value = 'No se pudo cargar la lista de pagos. Por favor, intenta de nuevo.'
    payments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPayments()
})

const todayRevenue = computed(() => {
  const today = getTodayDate()
  return payments.value
    .filter(p => p.date && String(p.date).slice(0, 10) === today)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
})

const monthRevenue = computed(() => {
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  return payments.value
    .filter(p => p.date && String(p.date).slice(0, 7) === currentMonth)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
})

const pendingDepositsCount = computed(() => {
  return payments.value.filter(p => p.paymentType === 'Deposit').length
})

const topPaymentMethod = computed(() => {
  if (payments.value.length === 0) return 'N/A'
  const counts = { Cash: 0, Card: 0, Transfer: 0 }
  payments.value.forEach(p => {
    if (counts[p.paymentMethod] !== undefined) counts[p.paymentMethod]++
  })
  let maxMethod = 'Cash'
  let maxCount = -1
  for (const [method, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      maxMethod = method
    }
  }
  if (maxMethod === 'Cash') return '💵 Efectivo'
  if (maxMethod === 'Card') return '💳 Tarjeta'
  return '🏦 Transferencia'
})

const cashRegisterSummary = computed(() => {
  const today = getTodayDate()
  const todayPayments = payments.value.filter(p => p.date && String(p.date).slice(0, 10) === today)
  
  let cash = 0, card = 0, transfer = 0
  todayPayments.forEach(p => {
    const amt = parseFloat(p.amount || 0)
    if (p.paymentMethod === 'Cash') cash += amt
    else if (p.paymentMethod === 'Card') card += amt
    else if (p.paymentMethod === 'Transfer') transfer += amt
  })

  return {
    cash,
    card,
    transfer,
    total: cash + card + transfer,
    count: todayPayments.length
  }
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
         filterDateRange.value !== 'all' ||
         filterMethod.value !== 'all' ||
         filterType.value !== 'all'
})

const resetFilters = () => {
  searchQuery.value = ''
  filterDateRange.value = 'all'
  customStartDate.value = ''
  customEndDate.value = ''
  filterMethod.value = 'all'
  filterType.value = 'all'
}

const filteredPayments = computed(() => {
  let list = [...payments.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(p => p.patientID && String(p.patientID).toLowerCase().includes(query))
  }

  if (filterDateRange.value === 'today') {
    const today = getTodayDate()
    list = list.filter(p => p.date && String(p.date).slice(0, 10) === today)
  } else if (filterDateRange.value === 'month') {
    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    list = list.filter(p => p.date && String(p.date).slice(0, 7) === currentMonth)
  } else if (filterDateRange.value === 'custom') {
    if (customStartDate.value) {
      list = list.filter(p => p.date && String(p.date).slice(0, 10) >= customStartDate.value)
    }
    if (customEndDate.value) {
      list = list.filter(p => p.date && String(p.date).slice(0, 10) <= customEndDate.value)
    }
  }

  if (filterMethod.value !== 'all') {
    list = list.filter(p => p.paymentMethod === filterMethod.value)
  }

  if (filterType.value !== 'all') {
    list = list.filter(p => p.paymentType === filterType.value)
  }

  return list
})

const getPaymentDetails = (payment) => {
  if (!payment.paymentType) return 'Sin detalle'
  const type = payment.paymentType === 'Deposit' ? 'Depósito (Parcial)' : 'Pago Final'
  return type
}

const getMethodIcon = (method) => {
  if (method === 'Cash') return 'bi bi-cash-stack'
  if (method === 'Card') return 'bi bi-credit-card'
  return 'bi bi-bank2'
}

const getMethodIconClass = (method) => {
  if (method === 'Cash') return 'badge bg-primary bg-opacity-10 text-primary p-2'
  if (method === 'Card') return 'badge bg-info bg-opacity-10 text-info p-2'
  return 'badge bg-secondary bg-opacity-10 text-secondary p-2'
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toFixed(2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'No definida'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Intl.DateTimeFormat('es-ES', options).format(date)
}

const getStatusBadgeClass = (status) => {
  if (status === 'Pagado' || status === 'Completed') return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
  if (status === 'Pendiente' || status === 'Partial') return 'bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25'
  return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'
}

const openReceiptModal = (payment) => {
  selectedPaymentForReceipt.value = payment
  showReceiptModal.value = true
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  selectedPaymentForReceipt.value = null
}

const printReceipt = () => {
  window.print()
}

const openCashRegisterModal = () => {
  showCashRegisterModal.value = true
}

const closeCashRegisterModal = () => {
  showCashRegisterModal.value = false
}

const printCashRegister = () => {
  window.print()
}

const confirmCashRegister = () => {
  successMessage.value = `¡Cierre de caja confirmado exitosamente! Recaudación total del día: $${formatCurrency(cashRegisterSummary.value.total)}`
  closeCashRegisterModal()
  setTimeout(() => { successMessage.value = '' }, 5000)
}

const exportToCSV = () => {
  if (filteredPayments.value.length === 0) return

  const headers = ['ID Comprobante', 'Cédula Paciente', 'Tipo de Pago', 'Método', 'Monto ($)', 'Fecha', 'Estado']
  const rows = filteredPayments.value.map(p => [
    `FD-${String(p.id).padStart(4, '0')}`,
    p.patientID,
    p.paymentType === 'Deposit' ? 'Depósito (Parcial)' : 'Pago Final',
    p.paymentMethod === 'Cash' ? 'Efectivo' : (p.paymentMethod === 'Card' ? 'Tarjeta' : 'Transferencia'),
    formatCurrency(p.amount),
    p.date,
    p.status === 'Completed' ? 'Completado' : 'Parcial'
  ])

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
  csvContent += headers.join(",") + "\r\n"
  rows.forEach(rowArray => {
    const row = rowArray.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    csvContent += row + "\r\n"
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `reporte_pagos_fabuladental_${getTodayDate()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const validateEditForm = () => {
  let isValid = true
  editErrors.value = {}

  if (!editForm.value.patientID || !/^[0-9]{10}$/.test(editForm.value.patientID)) {
    editErrors.value.patientID = 'El ID del paciente debe tener 10 dígitos.'
    isValid = false
  }
  if (editForm.value.amount === null || editForm.value.amount === '' || editForm.value.amount <= 0) {
    editErrors.value.amount = 'Ingrese un monto válido mayor a 0.'
    isValid = false
  }
  if (!editForm.value.date) {
    editErrors.value.date = 'La fecha es obligatoria.'
    isValid = false
  } else {
    const todayStr = getTodayDate()
    if (editForm.value.date > todayStr) {
      editErrors.value.date = 'La fecha de pago no puede ser en el futuro.'
      isValid = false
    }
  }

  return isValid
}

const openEditModal = (payment) => {
  editForm.value = { ...payment }
  if (editForm.value.date) {
    editForm.value.date = String(editForm.value.date).slice(0, 10)
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {}
  editErrors.value = {}
}

const savePayment = async () => {
  if (!validateEditForm()) return
  
  saving.value = true
  try {
    const id = editForm.value.id
    const payload = { ...editForm.value }
    await blApi.put(`/fabuladental/payments/${id}`, payload)
    
    const index = payments.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      payments.value[index] = { ...payload }
    }
    successMessage.value = 'Pago actualizado correctamente.'
    closeEditModal()
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error updating payment:', error)
    alert('Ocurrió un error al actualizar el pago.')
  } finally {
    saving.value = false
  }
}

const deletePayment = (payment) => {
  paymentToDelete.value = payment
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  paymentToDelete.value = null
}

const confirmDelete = async () => {
  if (!paymentToDelete.value) return
  
  deletingId.value = paymentToDelete.value.id
  try {
    await blApi.delete(`/fabuladental/payments/${paymentToDelete.value.id}`)
    payments.value = payments.value.filter((p) => p.id !== paymentToDelete.value.id)
    successMessage.value = 'Pago eliminado correctamente.'
    closeDeleteModal()
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error deleting payment:', error)
    alert('Error al eliminar el pago.')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}
.kpi-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.form-input-styled {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  transition: all 0.2s ease;
}
.form-input-styled:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
}
.input-error {
  border-color: #ef4444;
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.field-error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0;
}
.form-label-styled {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}
.spinner-ring {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media print {
  :deep(body *) {
    visibility: hidden !important;
  }
  .print-area, .print-area * {
    visibility: visible !important;
  }
  .print-area {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 30px !important;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
    z-index: 99999 !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
