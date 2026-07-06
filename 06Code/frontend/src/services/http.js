import axios from 'axios'

const CRUD_BASE_URL = import.meta.env.VITE_APP_CRUD_API_URL
const BL_BASE_URL = import.meta.env.VITE_APP_BL_API_URL

const crudApi = axios.create({
  baseURL: CRUD_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'admin'
  }
})

const blApi = axios.create({
  baseURL: BL_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

blApi.interceptors.request.use((config) => {
  const isPublicRoute = config._skipAuth === true
  if (!isPublicRoute) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

const handleApiError = (error) => {
  if (error.response) {
    return Promise.reject(error.response)
  }
  return Promise.reject({ status: 0, data: { message: 'Error de conexión con el servidor.' } })
}

crudApi.interceptors.response.use((response) => response, handleApiError)
blApi.interceptors.response.use((response) => response, handleApiError)

export { crudApi, blApi }
