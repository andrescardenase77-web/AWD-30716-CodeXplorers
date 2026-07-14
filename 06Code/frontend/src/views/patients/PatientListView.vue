<template>
  <div class="admin-view">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1>Registro de Pacientes</h1>
        <p class="admin-view__subtitle">Historiales clínicos, datos de contacto y gestión de expedientes.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm bg-white" @click="fetchPatients">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
        <RouterLink :to="{ name: 'patient-register' }" class="btn btn-primary-gradient d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold rounded-3 shadow-sm">
          <i class="bi bi-plus-lg"></i> Nuevo Paciente
        </RouterLink>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 border-start border-4 border-primary">
          <div class="metric-icon bg-primary bg-opacity-10 text-primary">
            <i class="bi bi-people-fill fs-3"></i>
          </div>
          <div>
            <span class="text-muted fw-bold text-uppercase d-block small">Total de Pacientes</span>
            <h3 class="fw-black mb-0 text-dark">{{ patients.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 border-start border-4 border-success">
          <div class="metric-icon bg-success bg-opacity-10 text-success">
            <i class="bi bi-person-check-fill fs-3"></i>
          </div>
          <div>
            <span class="text-muted fw-bold text-uppercase d-block small">Adultos</span>
            <h3 class="fw-black mb-0 text-dark">{{ adultCount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card-surface p-3 h-100 d-flex align-items-center gap-3 border-start border-4 border-warning">
          <div class="metric-icon bg-warning bg-opacity-10 text-warning-emphasis">
            <i class="bi bi-person-heart fs-3"></i>
          </div>
          <div>
            <span class="text-muted fw-bold text-uppercase d-block small">Menores</span>
            <h3 class="fw-black mb-0 text-dark">{{ minorCount }}</h3>
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

    <div class="card-surface p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-8 col-xl-6">
          <label class="form-label-styled">Buscar Paciente</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="searchQuery"
              type="search"
              class="form-control form-input-styled border-start-0"
              placeholder="Buscar por ID, nombre o teléfono"
            />
          </div>
        </div>
        <div class="col-12 col-md-4 col-xl-3">
          <label class="form-label-styled">Grupo de Edad</label>
          <select v-model="ageFilter" class="form-select form-input-styled">
            <option value="all">Todos los pacientes</option>
            <option value="adult">Adultos</option>
            <option value="minor">Menores</option>
          </select>
        </div>
        <div class="col-12 col-xl-3 d-flex justify-content-end">
          <button v-if="hasActiveFilters" class="btn btn-light w-100 text-muted" @click="resetFilters">
            <i class="bi bi-arrow-counterclockwise"></i> Limpiar
          </button>
        </div>
      </div>
    </div>

    <div class="card-surface overflow-hidden">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <span class="ms-3 text-secondary fw-semibold">Cargando expedientes de pacientes...</span>
      </div>

      <div v-else-if="filteredPatients.length === 0" class="text-center py-5 px-3">
        <i class="bi bi-person-lines-fill" style="font-size: 3.5rem; color: var(--color-border);"></i>
        <h5 class="mt-3 fw-bold" style="color: var(--color-text-secondary);">No se encontraron pacientes</h5>
        <p class="text-muted">No hay expedientes que coincidan con los filtros actuales.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead style="background-color: var(--color-background); border-bottom: 2px solid var(--color-border);">
            <tr>
              <th class="py-3 px-3 text-uppercase small text-secondary fw-bold">ID Paciente</th>
              <th class="py-3 text-uppercase small text-secondary fw-bold">Nombre Completo</th>
              <th class="py-3 text-uppercase small text-secondary fw-bold">Teléfono</th>
              <th class="py-3 text-uppercase small text-secondary fw-bold">Género</th>
              <th class="py-3 text-uppercase small text-secondary fw-bold">Fecha de Nacimiento</th>
              <th class="py-3 text-center text-uppercase small text-secondary fw-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in filteredPatients" :key="patient.patientID">
              <td class="px-3 fw-bold text-primary">{{ patient.patientID }}</td>
              <td class="fw-semibold">{{ patient.fullName }}</td>
              <td class="text-muted">{{ patient.phone }}</td>
              <td>{{ formatGender(patient.gender) }}</td>
              <td class="text-muted">{{ formatDate(patient.birthday) }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-outline-primary btn-sm" title="Editar" @click="openEditModal(patient)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" title="Eliminar" @click="openDeleteModal(patient)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content card-surface border-0 p-3 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold m-0" style="color: var(--color-text-primary);">Editar Paciente</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <PatientFormFields :form="editForm" :errors="editErrors" />
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancelar</button>
              <button type="button" class="btn-primary-gradient border-0 px-4" :disabled="saving" @click="savePatient">
                <span v-if="saving" class="spinner-ring me-1"></span>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.6); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 p-4 shadow-lg" style="border-radius: 16px;">
          <div class="modal-body text-center p-0">
            <div class="mb-4 mt-2">
              <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle" style="width: 80px; height: 80px;">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 2.5rem;"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-3" style="color: var(--color-text-primary);">¿Eliminar Paciente?</h4>
            <p class="text-muted mb-4 fs-6">
              Se eliminará el expediente de <strong class="text-dark">{{ patientToDelete?.fullName }}</strong>.
            </p>
            <div class="d-flex gap-3 justify-content-center mt-2">
              <button type="button" class="btn btn-light px-4 py-2 fw-semibold" @click="closeDeleteModal">Cancelar</button>
              <button type="button" class="btn btn-danger px-4 py-2 fw-semibold" :disabled="deleting" @click="confirmDelete">
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { deletePatient, getPatients, updatePatient } from '@/services/patientService.js'

const PatientFormFields = defineComponent({
  props: {
    form: { type: Object, required: true },
    errors: { type: Object, required: true }
  },
  setup(props) {
    const field = (key, label, attrs = {}) => h('div', { class: attrs.wrapperClass || 'col-12 col-md-6' }, [
      h('label', { class: 'form-label-styled' }, label),
      h(attrs.tag || 'input', {
        ...attrs,
        class: ['form-input-styled', attrs.class, props.errors[key] ? 'input-error' : ''],
        value: props.form[key],
        onInput: (event) => { props.form[key] = event.target.value }
      }, attrs.children || []),
      props.errors[key] ? h('p', { class: 'field-error-msg mt-1' }, props.errors[key]) : null
    ])

    return () => h('div', { class: 'row g-3' }, [
      field('patientID', 'ID Paciente', { maxlength: 10, disabled: true }),
      field('fullName', 'Nombre Completo'),
      field('birthday', 'Fecha de Nacimiento', { type: 'date' }),
      field('phone', 'Teléfono', { maxlength: 10 }),
      field('gender', 'Género', {
        tag: 'select',
        children: [
          h('option', { value: '' }, 'Seleccionar género'),
          h('option', { value: 'male' }, 'Masculino'),
          h('option', { value: 'female' }, 'Femenino'),
          h('option', { value: 'other' }, 'Otro')
        ]
      }),
      field('reasonForConsultation', 'Motivo de Consulta', { wrapperClass: 'col-12' }),
      field('legalRepresentative', 'Representante Legal', { wrapperClass: 'col-12' })
    ])
  }
})

const patients = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const searchQuery = ref('')
const ageFilter = ref('all')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const patientToDelete = ref(null)

const editForm = reactive({
  patientID: '',
  fullName: '',
  birthday: '',
  phone: '',
  gender: '',
  reasonForConsultation: '',
  legalRepresentative: ''
})

const editErrors = reactive({
  patientID: '',
  fullName: '',
  birthday: '',
  phone: '',
  gender: '',
  reasonForConsultation: '',
  legalRepresentative: ''
})

const fetchPatients = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    patients.value = await getPatients()
  } catch (error) {
    errorMessage.value = error.message
    patients.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPatients)

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

const adultCount = computed(() => patients.value.filter((patient) => (getAge(patient.birthday) ?? 0) >= 18).length)
const minorCount = computed(() => patients.value.filter((patient) => (getAge(patient.birthday) ?? 99) < 18).length)
const hasActiveFilters = computed(() => searchQuery.value !== '' || ageFilter.value !== 'all')

const filteredPatients = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return patients.value.filter((patient) => {
    const matchesSearch = !query ||
      String(patient.patientID).toLowerCase().includes(query) ||
      String(patient.fullName).toLowerCase().includes(query) ||
      String(patient.phone).toLowerCase().includes(query)
    const age = getAge(patient.birthday)
    const matchesAge = ageFilter.value === 'all' ||
      (ageFilter.value === 'adult' && age !== null && age >= 18) ||
      (ageFilter.value === 'minor' && age !== null && age < 18)
    return matchesSearch && matchesAge
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  ageFilter.value = 'all'
}

const formatDate = (value) => {
  if (!value) return 'No definida'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

const genderMap = { male: 'Masculino', female: 'Femenino', other: 'Otro' }
const formatGender = (value) => {
  if (!value) return 'No definido'
  return genderMap[String(value).toLowerCase()] || (String(value).charAt(0).toUpperCase() + String(value).slice(1))
}

const resetEditErrors = () => {
  Object.keys(editErrors).forEach((key) => {
    editErrors[key] = ''
  })
}

const validatePatientForm = () => {
  resetEditErrors()
  let isValid = true
  if (!/^[0-9]{10}$/.test(String(editForm.patientID))) {
    editErrors.patientID = 'El ID del paciente debe contener 10 dígitos.'
    isValid = false
  }
  if (!editForm.fullName || editForm.fullName.trim().length < 3) {
    editErrors.fullName = 'El nombre completo debe tener al menos 3 caracteres.'
    isValid = false
  }
  if (!editForm.birthday) {
    editErrors.birthday = 'La fecha de nacimiento es obligatoria.'
    isValid = false
  }
  if (!/^[0-9]{10}$/.test(String(editForm.phone))) {
    editErrors.phone = 'El teléfono debe contener 10 dígitos.'
    isValid = false
  }
  if (!editForm.gender) {
    editErrors.gender = 'El género es obligatorio.'
    isValid = false
  }
  if (!editForm.reasonForConsultation || editForm.reasonForConsultation.trim().length < 5) {
    editErrors.reasonForConsultation = 'El motivo debe contener al menos 5 caracteres.'
    isValid = false
  }
  const age = getAge(editForm.birthday)
  if (age !== null && age < 18 && !editForm.legalRepresentative.trim()) {
    editErrors.legalRepresentative = 'El representante legal es obligatorio para menores de edad.'
    isValid = false
  }
  return isValid
}

const openEditModal = (patient) => {
  editForm.patientID = String(patient.patientID || '')
  editForm.fullName = patient.fullName || ''
  editForm.birthday = patient.birthday ? String(patient.birthday).slice(0, 10) : ''
  editForm.phone = patient.phone || ''
  editForm.gender = patient.gender || ''
  editForm.reasonForConsultation = patient.reasonForConsultation || ''
  editForm.legalRepresentative = patient.legalRepresentative || ''
  resetEditErrors()
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  resetEditErrors()
}

const savePatient = async () => {
  if (!validatePatientForm()) return
  saving.value = true
  errorMessage.value = ''
  try {
    await updatePatient(editForm.patientID, { ...editForm })
    successMessage.value = 'Paciente actualizado correctamente.'
    closeEditModal()
    await fetchPatients()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}

const openDeleteModal = (patient) => {
  patientToDelete.value = patient
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  patientToDelete.value = null
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  if (!patientToDelete.value) return
  deleting.value = true
  errorMessage.value = ''
  try {
    await deletePatient(patientToDelete.value.patientID)
    successMessage.value = 'Paciente eliminado correctamente.'
    closeDeleteModal()
    await fetchPatients()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.metric-icon {
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
