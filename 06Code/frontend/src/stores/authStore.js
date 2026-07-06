import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(authService.retrieveToken())
  const isAuthenticated = ref(authService.isAuthenticated())

  async function login(username, password) {
    const data = await authService.login(username, password)
    const receivedToken = data.token ?? data.access_token ?? data.jwt
    if (!receivedToken) {
      throw new Error('Token no encontrado en la respuesta del servidor.')
    }
    authService.storeToken(receivedToken)
    token.value = receivedToken
    isAuthenticated.value = true
    return receivedToken
  }

  function logout() {
    authService.removeToken()
    token.value = null
    isAuthenticated.value = false
  }

  return { token, isAuthenticated, login, logout }
})
