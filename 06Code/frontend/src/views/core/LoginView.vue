<template>
  <div class="login-page">
    <div class="login-split-left gradient-header">
      <div class="split-left-content">
        <div class="d-flex flex-column align-items-center gap-2 mb-4">
          <i class="bi bi-tooth text-white" style="font-size: 4rem;"></i>
          <span class="fs-2 fw-bold text-white text-nowrap">Fábula Dental</span>
        </div>
        <h2 class="split-left-title">Sistema de Gestión</h2>
        <p class="split-left-subtitle">
          Administra tu clínica de forma fácil, segura y eficiente.
        </p>
        <div class="split-left-decoration"></div>
      </div>
    </div>

    <div class="login-split-right">
      <div class="login-form-container">
        <div class="login-form-header">
          <h1 class="login-title">Iniciar Sesión</h1>
          <p class="login-description">Ingresa tus credenciales para acceder al panel.</p>
        </div>

        <Transition name="fade">
          <div v-if="errorMessage" class="alert-error" role="alert" id="login-error-alert">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {{ errorMessage }}
          </div>
        </Transition>

        <form @submit.prevent="handleLoginSubmit" class="login-form" novalidate id="login-form">
          <div class="form-group">
            <label for="username-input" class="form-label-styled">Usuario</label>
            <input
              id="username-input"
              v-model="credentials.username"
              type="text"
              class="form-input-styled"
              placeholder="Ingresa tu usuario"
              autocomplete="username"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password-input" class="form-label-styled">Contraseña</label>
            <div class="password-field">
              <input
                id="password-input"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input-styled"
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                id="toggle-password-btn"
              >
                <svg v-if="!showPassword" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn-primary-gradient submit-button"
            :disabled="isLoading || !isFormValid"
            id="login-submit-btn"
          >
            <span v-if="isLoading" class="spinner-ring"></span>
            <span>{{ isLoading ? 'Verificando...' : 'Ingresar' }}</span>
          </button>
        </form>

        <div class="login-footer-link">
          <RouterLink :to="{ name: 'landing' }">
            ← Volver al inicio
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({ username: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const isFormValid = computed(
  () => credentials.value.username.trim().length > 0 && credentials.value.password.length > 0
)

const ERROR_MESSAGES = {
  401: 'Credenciales incorrectas. Verifica tu usuario y contraseña.',
  403: 'Acceso denegado. No tienes permiso para ingresar.',
  500: 'Error interno del servidor. Intenta más tarde.',
  0: 'Error de conexión. Verifica tu red e intenta de nuevo.'
}

async function handleLoginSubmit() {
  if (!isFormValid.value) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(credentials.value.username, credentials.value.password)
    router.push({ name: 'dashboard' })
  } catch (error) {
    const status = error?.status ?? 0
    errorMessage.value =
      ERROR_MESSAGES[status] ?? 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-split-left {
  flex: 0 0 42%;
  display: none;
  position: relative;
  overflow: hidden;
}

@media (min-width: 900px) {
  .login-split-left {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.split-left-content {
  padding: 3rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.login-logo {
  height: 90px;
  width: auto;
  border-radius: 12px;
  object-fit: contain;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.split-left-title {
  font-size: 1.7rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.split-left-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 280px;
  margin: 0 auto;
}

.split-left-decoration {
  position: absolute;
  bottom: -80px;
  right: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  z-index: 1;
}

.login-split-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: var(--color-background);
}

.login-form-container {
  width: 100%;
  max-width: 420px;
}

.login-form-header {
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.9rem;
  font-weight: 900;
  color: var(--color-text-primary);
  margin-bottom: 0.4rem;
}

.login-description {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.password-field {
  position: relative;
}

.password-field .form-input-styled {
  padding-right: 2.75rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color var(--transition-base);
}

.password-toggle:hover {
  color: var(--color-primary-start);
}

.submit-button {
  width: 100%;
  justify-content: center;
  padding: 0.8rem !important;
  font-size: 1rem !important;
  margin-top: 0.5rem;
  border-radius: 10px !important;
}

.login-footer-link {
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
