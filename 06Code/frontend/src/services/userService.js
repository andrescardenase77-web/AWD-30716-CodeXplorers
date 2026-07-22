import { blApi } from '@/services/http'

const REGISTER_PATH = '/fabuladental/auth/register'

const getErrorMessage = (error, fallback) => {
  return error?.data?.message || error?.data?.error || error?.response?.data?.message || error?.response?.data?.error || fallback
}

export async function createUser(payload) {
  try {
    const response = await blApi.post(REGISTER_PATH, payload, { _skipAuth: true })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to create user.'))
  }
}
