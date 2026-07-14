<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>{{ config.title }}</h1>
        <p class="admin-view__subtitle">{{ config.subtitle }}</p>
      </div>
      <RouterLink :to="{ name: 'patients' }" class="btn btn-light d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm">
        <i class="bi bi-arrow-left"></i> Registro
      </RouterLink>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-5">
        <div class="card-surface p-4 p-md-5 h-100">
          <form @submit.prevent="runRule" novalidate>
            <div class="d-flex flex-column gap-3 mb-4">
              <div v-for="field in config.fields" :key="field.key">
                <label class="form-label-styled">{{ field.label }}</label>
                <input
                  v-if="field.type !== 'textarea'"
                  v-model="form[field.key]"
                  :type="field.type"
                  class="form-input-styled"
                  :placeholder="field.placeholder"
                />
                <textarea
                  v-else
                  v-model="form[field.key]"
                  class="form-input-styled"
                  rows="4"
                  :placeholder="field.placeholder"
                ></textarea>
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary-gradient w-100 d-flex justify-content-center align-items-center gap-2 py-3 fw-bold shadow" :disabled="loading">
              <span v-if="loading" class="spinner-ring"></span>
              <i v-else :class="config.icon"></i>
              <span>{{ loading ? 'Procesando...' : config.action }}</span>
            </button>
          </form>
        </div>
      </div>

      <div class="col-12 col-lg-7">
        <div class="card-surface p-4 p-md-5 h-100">
          <div v-if="!result" class="empty-state">
            <i :class="config.icon"></i>
            <h5 class="fw-bold mt-3 mb-2">Listo para calcular</h5>
            <p class="text-muted mb-0">{{ config.emptyText }}</p>
          </div>

          <div v-else>
            <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 mb-4">Resultado</span>
            <div class="result-grid">
              <div v-for="item in renderedResults" :key="item.label" class="result-item">
                <span class="result-label">{{ item.label }}</span>
                <strong :class="['result-value', item.tone ? `text-${item.tone}` : '']">{{ item.value }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { runPatientRule } from '@/services/patientService.js'

const route = useRoute()
const loading = ref(false)
const errorMessage = ref('')
const result = ref(null)
const form = reactive({})

const ruleConfigs = {
  pediatric: {
    title: 'Categoría Pediátrica',
    subtitle: 'Clasifica al paciente por grupo de edad clínica y factor de restricción de dosis.',
    action: 'Calcular Categoría',
    icon: 'bi bi-person-heart fs-5',
    path: 'pediatric-category',
    emptyText: 'Ingrese la fecha de nacimiento para clasificar al paciente.',
    fields: [
      { key: 'birthday', label: 'Fecha de Nacimiento', type: 'date' }
    ],
    mapResult: (data) => [
      { label: 'Categoría', value: data.pediatricCategory, tone: 'primary' },
      { label: 'Edad', value: `${data.calculatedAgeYears} años, ${data.calculatedAgeMonths} meses` },
      { label: 'Factor de Dosis', value: data.dosageRestrictionFactor, tone: 'success' }
    ]
  },
  birthday: {
    title: 'Verificación de Cumpleaños',
    subtitle: 'Calcula los días restantes hasta el próximo cumpleaños del paciente.',
    action: 'Verificar Cumpleaños',
    icon: 'bi bi-calendar-heart fs-5',
    path: 'days-to-birthday',
    emptyText: 'Ingrese la fecha de nacimiento para calcular el próximo cumpleaños.',
    fields: [
      { key: 'birthday', label: 'Fecha de Nacimiento', type: 'date' }
    ],
    mapResult: (data) => [
      { label: 'Días hasta el Cumpleaños', value: data.daysUntilBirthday, tone: 'primary' },
      { label: 'Semana de Cumpleaños', value: data.isBirthdayWeek ? 'Sí' : 'No', tone: data.isBirthdayWeek ? 'warning' : 'success' }
    ]
  },
  consultation: {
    title: 'Tiempo de Consulta',
    subtitle: 'Estima la duración de la cita según la edad y el motivo de consulta.',
    action: 'Estimar Tiempo',
    icon: 'bi bi-clock-history fs-5',
    path: 'consultation-time-estimation',
    emptyText: 'Ingrese los datos de edad y motivo clínico para estimar el tiempo de la cita.',
    fields: [
      { key: 'birthday', label: 'Fecha de Nacimiento', type: 'date' },
      { key: 'reasonForConsultation', label: 'Motivo de Consulta', type: 'textarea', placeholder: 'Describa el motivo de la consulta' }
    ],
    mapResult: (data) => [
      { label: 'Tiempo Estimado', value: `${data.estimatedConsultationMinutes} minutos`, tone: 'primary' },
      { label: 'Tiempo Base', value: `${data.baseMinutes} minutos` }
    ]
  },
  legal: {
    title: 'Representante Legal',
    subtitle: 'Valida si un menor requiere representante legal.',
    action: 'Validar Requisito',
    icon: 'bi bi-shield-check fs-5',
    path: 'legal-representative-validation',
    emptyText: 'Ingrese la fecha de nacimiento y el nombre del tutor cuando aplique.',
    fields: [
      { key: 'birthday', label: 'Fecha de Nacimiento', type: 'date' },
      { key: 'legalRepresentative', label: 'Representante Legal', type: 'text', placeholder: 'Nombre completo del tutor' }
    ],
    mapResult: (data) => [
      { label: 'Representante Requerido', value: data.requiresLegalRepresentative ? 'Requerido' : 'No Requerido', tone: data.requiresLegalRepresentative ? 'warning' : 'success' },
      { label: 'Mensaje de Validación', value: data.message }
    ]
  }
}

const config = computed(() => ruleConfigs[route.meta.ruleType] || ruleConfigs.pediatric)
const renderedResults = computed(() => result.value ? config.value.mapResult(result.value) : [])

const resetForm = () => {
  Object.keys(form).forEach((key) => {
    delete form[key]
  })
  config.value.fields.forEach((field) => {
    form[field.key] = ''
  })
  result.value = null
  errorMessage.value = ''
}

watch(() => route.meta.ruleType, resetForm, { immediate: true })

const validateForm = () => {
  return config.value.fields.every((field) => {
    if (field.key === 'legalRepresentative') return true
    return String(form[field.key] || '').trim().length > 0
  })
}

const runRule = async () => {
  errorMessage.value = ''
  result.value = null
  if (!validateForm()) {
    errorMessage.value = 'Por favor complete los campos requeridos.'
    return
  }
  loading.value = true
  try {
    result.value = await runPatientRule(config.value.path, { ...form })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-input-styled {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.form-input-styled:focus {
  outline: none;
  border-color: var(--color-primary-start);
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
}

.empty-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 3rem;
  color: var(--color-border);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.result-item {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.result-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.result-value {
  color: var(--color-text-primary);
  font-size: 1.1rem;
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
</style>
