import { blApi } from './http.js'

const TOKEN_KEY = 'auth_token'
const ROLE_KEY = 'auth_role'

const authService = {
  async login(username, password) {
    const response = await blApi.post(
      '/fabuladental/auth/login',
      { username, password },
      { _skipAuth: true }
    )
    return response.data
  },

  storeToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  retrieveToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  storeRole(role) {
    localStorage.setItem(ROLE_KEY, role)
  },

  retrieveRole() {
    return localStorage.getItem(ROLE_KEY)
  },

  removeRole() {
    localStorage.removeItem(ROLE_KEY)
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  }
}

export default authService
