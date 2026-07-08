import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(authService.retrieveToken())
  const role = ref(authService.retrieveRole())
  const isAuthenticated = ref(authService.isAuthenticated())

  async function login(username, password) {
    const data = await authService.login(username, password)
    const receivedToken = data.token ?? data.access_token ?? data.jwt
    const receivedRole = data.role
    if (!receivedToken) {
      throw new Error('Token no encontrado en la respuesta del servidor.')
    }
    authService.storeToken(receivedToken)
    if (receivedRole) {
      authService.storeRole(receivedRole)
      role.value = receivedRole
    }
    token.value = receivedToken
    isAuthenticated.value = true
    return { token: receivedToken, role: receivedRole }
  }

  function logout() {
    authService.removeToken()
    authService.removeRole()
    token.value = null
    role.value = null
    isAuthenticated.value = false
  }

  return { token, role, isAuthenticated, login, logout }
})
