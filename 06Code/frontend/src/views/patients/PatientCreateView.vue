<template>
  <div class="admin-view">
    <div class="mb-4">
      <div class="d-flex align-items-center gap-2">
        <RouterLink :to="{ name: 'patients' }" class="btn btn-light btn-sm rounded-circle p-2 text-secondary border">
          <i class="bi bi-arrow-left"></i>
        </RouterLink>
        <div>
          <h1 class="m-0">Register Patient</h1>
          <p class="admin-view__subtitle m-0">Create a clinical record for dental care follow-up.</p>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">
        <div v-if="successMessage" class="alert alert-success alert-dismissible d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i class="bi bi-check-circle-fill me-2 fs-5"></i>
          {{ successMessage }}
          <button type="button" class="btn-close ms-auto" @click="successMessage = ''"></button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {{ errorMessage }}
        </div>

        <div class="card-surface p-4 p-md-5">
          <form @submit.prevent="submitForm" novalidate>
            <div class="row g-3 mb-4">
              <div class="col-12 col-md-6">
                <label class="form-label-styled">Patient ID</label>
                <input v-model="form.patientID" type="text" maxlength="10" class="form-input-styled" :class="{ 'input-error': errors.patientID }" placeholder="1712345678" />
                <p v-if="errors.patientID" class="field-error-msg mt-1">{{ errors.patientID }}</p>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label-styled">Full Name</label>
                <input v-model="form.fullName" type="text" class="form-input-styled" :class="{ 'input-error': errors.fullName }" placeholder="First and last name" />
                <p v-if="errors.fullName" class="field-error-msg mt-1">{{ errors.fullName }}</p>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label-styled">Birthday</label>
                <input v-model="form.birthday" type="date" class="form-input-styled" :class="{ 'input-error': errors.birthday }" />
                <p v-if="errors.birthday" class="field-error-msg mt-1">{{ errors.birthday }}</p>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label-styled">Phone</label>
                <input v-model="form.phone" type="text" maxlength="10" class="form-input-styled" :class="{ 'input-error': errors.phone }" placeholder="0987654321" />
                <p v-if="errors.phone" class="field-error-msg mt-1">{{ errors.phone }}</p>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label-styled">Gender</label>
                <select v-model="form.gender" class="form-select form-input-styled" :class="{ 'input-error': errors.gender }">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <p v-if="errors.gender" class="field-error-msg mt-1">{{ errors.gender }}</p>
              </div>
              <div class="col-12">
                <label class="form-label-styled">Reason for Consultation</label>
                <input v-model="form.reasonForConsultation" type="text" class="form-input-styled" :class="{ 'input-error': errors.reasonForConsultation }" placeholder="Brief clinical reason" />
                <p v-if="errors.reasonForConsultation" class="field-error-msg mt-1">{{ errors.reasonForConsultation }}</p>
              </div>
              <div class="col-12">
                <label class="form-label-styled d-flex justify-content-between">
                  <span>Legal Representative</span>
                  <span v-if="requiresLegalRepresentative" class="badge bg-warning bg-opacity-10 text-warning-emphasis">Required for minors</span>
                </label>
                <input v-model="form.legalRepresentative" type="text" class="form-input-styled" :class="{ 'input-error': errors.legalRepresentative }" placeholder="Guardian full name if applicable" />
                <p v-if="errors.legalRepresentative" class="field-error-msg mt-1">{{ errors.legalRepresentative }}</p>
              </div>
            </div>

            <div class="d-flex flex-column flex-md-row gap-3">
              <button type="submit" class="btn btn-primary-gradient w-100 d-flex justify-content-center align-items-center gap-2 py-3 fw-bold shadow" :disabled="submitting">
                <span v-if="submitting" class="spinner-ring"></span>
                <i v-else class="bi bi-person-plus-fill fs-5"></i>
                <span>{{ submitting ? 'Registering...' : 'Register Patient' }}</span>
              </button>
              <button type="button" class="btn btn-outline-secondary px-4" @click="resetForm(false)">
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { createPatient } from '@/services/patientService.js'

const successMessage = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const form = reactive({
  patientID: '',
  fullName: '',
  birthday: '',
  phone: '',
  gender: '',
  reasonForConsultation: '',
  legalRepresentative: ''
})

const errors = reactive({
  patientID: '',
  fullName: '',
  birthday: '',
  phone: '',
  gender: '',
  reasonForConsultation: '',
  legalRepresentative: ''
})

const getAge = (birthday) => {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

const requiresLegalRepresentative = computed(() => {
  const age = getAge(form.birthday)
  return age !== null && age < 18
})

const resetErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const validateForm = () => {
  resetErrors()
  let isValid = true
  if (!/^[0-9]{10}$/.test(form.patientID)) {
    errors.patientID = 'Patient ID must contain 10 digits.'
    isValid = false
  }
  if (!form.fullName || form.fullName.trim().length < 3) {
    errors.fullName = 'Full name must contain at least 3 characters.'
    isValid = false
  }
  if (!form.birthday) {
    errors.birthday = 'Birthday is required.'
    isValid = false
  } else if (new Date(form.birthday) > new Date()) {
    errors.birthday = 'Birthday cannot be in the future.'
    isValid = false
  }
  if (!/^[0-9]{10}$/.test(form.phone)) {
    errors.phone = 'Phone must contain 10 digits.'
    isValid = false
  }
  if (!form.gender) {
    errors.gender = 'Gender is required.'
    isValid = false
  }
  if (!form.reasonForConsultation || form.reasonForConsultation.trim().length < 5) {
    errors.reasonForConsultation = 'Reason must contain at least 5 characters.'
    isValid = false
  }
  if (requiresLegalRepresentative.value && !form.legalRepresentative.trim()) {
    errors.legalRepresentative = 'Legal representative is required for minors.'
    isValid = false
  }
  return isValid
}

const resetForm = (keepMessages = false) => {
  form.patientID = ''
  form.fullName = ''
  form.birthday = ''
  form.phone = ''
  form.gender = ''
  form.reasonForConsultation = ''
  form.legalRepresentative = ''
  resetErrors()
  if (!keepMessages) {
    successMessage.value = ''
    errorMessage.value = ''
  }
}

const submitForm = async () => {
  successMessage.value = ''
  errorMessage.value = ''
  if (!validateForm()) return
  submitting.value = true
  try {
    await createPatient({ ...form })
    successMessage.value = 'Patient registered successfully.'
    resetForm(true)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    submitting.value = false
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

.input-error {
  border-color: #ef4444;
}

.field-error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0;
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
