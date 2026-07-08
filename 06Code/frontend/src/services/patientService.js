import { crudApi, blApi } from '@/services/http'

const PATIENTS_PATH = '/fabuladental/patients'

const getErrorMessage = (error, fallback) => {
  return error?.data?.message || error?.data?.error || error?.response?.data?.message || error?.response?.data?.error || fallback
}

export async function getPatients() {
  try {
    const response = await crudApi.get(PATIENTS_PATH)
    return response.data || []
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load patients.'))
  }
}

export async function createPatient(payload) {
  try {
    const response = await crudApi.post(PATIENTS_PATH, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to create patient.'))
  }
}

export async function updatePatient(patientId, payload) {
  try {
    const response = await crudApi.put(`${PATIENTS_PATH}/${patientId}`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to update patient.'))
  }
}

export async function deletePatient(patientId) {
  try {
    const response = await crudApi.delete(`${PATIENTS_PATH}/${patientId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to delete patient.'))
  }
}

export async function runPatientRule(rulePath, payload) {
  try {
    const response = await blApi.post(`${PATIENTS_PATH}/${rulePath}`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to process patient rule.'))
  }
}
