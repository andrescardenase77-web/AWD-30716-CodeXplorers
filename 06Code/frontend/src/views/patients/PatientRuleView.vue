<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>{{ config.title }}</h1>
        <p class="admin-view__subtitle">{{ config.subtitle }}</p>
      </div>
      <RouterLink :to="{ name: 'patients' }" class="btn btn-light d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm">
        <i class="bi bi-arrow-left"></i> Registry
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
              <span>{{ loading ? 'Processing...' : config.action }}</span>
            </button>
          </form>
        </div>
      </div>

      <div class="col-12 col-lg-7">
        <div class="card-surface p-4 p-md-5 h-100">
          <div v-if="!result" class="empty-state">
            <i :class="config.icon"></i>
            <h5 class="fw-bold mt-3 mb-2">Ready to calculate</h5>
            <p class="text-muted mb-0">{{ config.emptyText }}</p>
          </div>

          <div v-else>
            <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 mb-4">Result</span>
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
    title: 'Pediatric Category',
    subtitle: 'Classifies the patient by clinical age group and dosage restriction factor.',
    action: 'Calculate Category',
    icon: 'bi bi-person-heart fs-5',
    path: 'pediatric-category',
    emptyText: 'Enter the date of birth to classify the patient.',
    fields: [
      { key: 'birthday', label: 'Date of Birth', type: 'date' }
    ],
    mapResult: (data) => [
      { label: 'Category', value: data.pediatricCategory, tone: 'primary' },
      { label: 'Age', value: `${data.calculatedAgeYears} years, ${data.calculatedAgeMonths} months` },
      { label: 'Dosage Factor', value: data.dosageRestrictionFactor, tone: 'success' }
    ]
  },
  birthday: {
    title: 'Birthday Check',
    subtitle: 'Calculates days remaining until the next patient birthday.',
    action: 'Check Birthday',
    icon: 'bi bi-calendar-heart fs-5',
    path: 'days-to-birthday',
    emptyText: 'Enter the date of birth to calculate the next birthday.',
    fields: [
      { key: 'birthday', label: 'Date of Birth', type: 'date' }
    ],
    mapResult: (data) => [
      { label: 'Days Until Birthday', value: data.daysUntilBirthday, tone: 'primary' },
      { label: 'Birthday Week', value: data.isBirthdayWeek ? 'Yes' : 'No', tone: data.isBirthdayWeek ? 'warning' : 'success' }
    ]
  },
  consultation: {
    title: 'Consultation Time',
    subtitle: 'Estimates appointment duration from age and consultation reason.',
    action: 'Estimate Time',
    icon: 'bi bi-clock-history fs-5',
    path: 'consultation-time-estimation',
    emptyText: 'Enter patient age data and clinical reason to estimate appointment time.',
    fields: [
      { key: 'birthday', label: 'Date of Birth', type: 'date' },
      { key: 'reasonForConsultation', label: 'Reason for Consultation', type: 'textarea', placeholder: 'Describe the reason for consultation' }
    ],
    mapResult: (data) => [
      { label: 'Estimated Time', value: `${data.estimatedConsultationMinutes} minutes`, tone: 'primary' },
      { label: 'Base Time', value: `${data.baseMinutes} minutes` }
    ]
  },
  legal: {
    title: 'Legal Representative',
    subtitle: 'Validates whether a minor requires a legal representative.',
    action: 'Validate Requirement',
    icon: 'bi bi-shield-check fs-5',
    path: 'legal-representative-validation',
    emptyText: 'Enter the date of birth and guardian name when applicable.',
    fields: [
      { key: 'birthday', label: 'Date of Birth', type: 'date' },
      { key: 'legalRepresentative', label: 'Legal Representative', type: 'text', placeholder: 'Guardian full name' }
    ],
    mapResult: (data) => [
      { label: 'Representative Required', value: data.requiresLegalRepresentative ? 'Required' : 'Not Required', tone: data.requiresLegalRepresentative ? 'warning' : 'success' },
      { label: 'Validation Message', value: data.message }
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
    errorMessage.value = 'Please complete the required fields.'
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
