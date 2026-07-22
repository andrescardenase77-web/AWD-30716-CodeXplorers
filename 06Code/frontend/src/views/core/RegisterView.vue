<template>
  <div class="login-page">
    <div class="login-split-left gradient-header">
      <div class="split-left-content">
        <div class="d-flex flex-column align-items-center gap-2 mb-4">
          <i class="bi bi-tooth text-white" style="font-size: 4rem;"></i>
          <span class="fs-2 fw-bold text-white text-nowrap">Fábula Dental</span>
        </div>
        <h2 class="split-left-title">Registro de Usuario</h2>
        <p class="split-left-subtitle">
          Crea una nueva cuenta para acceder a la gestión de la clínica.
        </p>
        <div class="split-left-decoration"></div>
      </div>
    </div>

    <div class="login-split-right">
      <div class="login-form-container">
        <div class="login-form-header">
          <h1 class="login-title">Crear Cuenta</h1>
          <p class="login-description">Ingresa los datos solicitados para registrar un nuevo usuario.</p>
        </div>

        <Transition name="fade">
          <div v-if="successMessage" class="alert-success-custom mb-3" role="alert" id="register-success-alert">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ successMessage }}
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="errorMessage" class="alert-error-custom mb-3" role="alert" id="register-error-alert">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {{ errorMessage }}
          </div>
        </Transition>

        <form @submit.prevent="handleRegisterSubmit" class="login-form" novalidate id="register-form">
          <div class="form-group">
            <label for="username-input" class="form-label-styled">Usuario</label>
            <input
              id="username-input"
              v-model="userData.username"
              type="text"
              class="form-input-styled"
              :class="{ 'input-error': validationErrors.username }"
              placeholder="Nombre de usuario"
              autocomplete="username"
              required
              :disabled="isLoading || registrationSuccess"
            />
            <p v-if="validationErrors.username" class="field-error-msg mt-1">{{ validationErrors.username }}</p>
          </div>

          <div class="form-group">
            <label for="password-input" class="form-label-styled">Contraseña</label>
            <div class="password-field">
              <input
                id="password-input"
                v-model="userData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input-styled"
                :class="{ 'input-error': validationErrors.password }"
                placeholder="Ingresa tu contraseña"
                autocomplete="new-password"
                required
                :disabled="isLoading || registrationSuccess"
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
            <p v-if="validationErrors.password" class="field-error-msg mt-1">{{ validationErrors.password }}</p>
          </div>

          <div class="form-group">
            <label for="confirm-password-input" class="form-label-styled">Confirmar Contraseña</label>
            <div class="password-field">
              <input
                id="confirm-password-input"
                v-model="userData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input-styled"
                :class="{ 'input-error': validationErrors.confirmPassword }"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                required
                :disabled="isLoading || registrationSuccess"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                id="toggle-confirm-password-btn"
              >
                <svg v-if="!showConfirmPassword" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="validationErrors.confirmPassword" class="field-error-msg mt-1">{{ validationErrors.confirmPassword }}</p>
          </div>

          <div class="form-group">
            <label for="role-select" class="form-label-styled">Rol</label>
            <select
              id="role-select"
              v-model="userData.role"
              class="form-select form-input-styled"
              :class="{ 'input-error': validationErrors.role }"
              required
              :disabled="isLoading || registrationSuccess"
            >
              <option value="">Selecciona un rol</option>
              <option value="Administrator">Administrador</option>
              <option value="Dentist">Dentista</option>
              <option value="Receptionist">Recepcionista</option>
            </select>
            <p v-if="validationErrors.role" class="field-error-msg mt-1">{{ validationErrors.role }}</p>
          </div>

          <button
            type="submit"
            class="btn-primary-gradient submit-button"
            :disabled="isLoading || registrationSuccess"
            id="register-submit-btn"
          >
            <span v-if="isLoading" class="spinner-ring"></span>
            <span>{{ isLoading ? 'Registrando...' : 'Registrar Cuenta' }}</span>
          </button>
        </form>

        <div class="login-footer-link">
          <RouterLink :to="{ name: 'login' }" id="back-to-login-link">
            ← Volver a Iniciar Sesión
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { createUser } from '@/services/userService.js'

const router = useRouter()

const userData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const validationErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const registrationSuccess = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  return userData.username.trim().length >= 3 &&
         userData.password.length >= 6 &&
         userData.confirmPassword.length >= 6 &&
         userData.role !== ''
})

function resetValidationErrors() {
  validationErrors.username = ''
  validationErrors.password = ''
  validationErrors.confirmPassword = ''
  validationErrors.role = ''
}

function validateFields() {
  resetValidationErrors()
  let isValid = true

  if (userData.username.trim().length < 3) {
    validationErrors.username = 'El usuario debe tener al menos 3 caracteres.'
    isValid = false
  }

  if (userData.password.length < 6) {
    validationErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    isValid = false
  }

  if (userData.password !== userData.confirmPassword) {
    validationErrors.confirmPassword = 'Las contraseñas no coinciden.'
    isValid = false
  }

  if (!userData.role) {
    validationErrors.role = 'Debes seleccionar un rol.'
    isValid = false
  }

  return isValid
}

async function handleRegisterSubmit() {
  if (!validateFields()) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      username: userData.username.trim(),
      password: userData.password,
      role: userData.role
    }
    
    await createUser(payload)
    
    successMessage.value = 'Usuario registrado exitosamente. Redirigiendo a inicio de sesión...'
    registrationSuccess.value = true
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
  } catch (error) {
    console.error('Error registering user:', error)
    errorMessage.value = error.message || 'Error al registrar el usuario. Por favor, intente de nuevo.'
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

.alert-error-custom {
  background: #fff5f5;
  border: 1.5px solid #fed7d7;
  color: var(--color-danger);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-success-custom {
  background: #f0fff4;
  border: 1.5px solid #c6f6d5;
  color: var(--color-success);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-error {
  border-color: #ef4444;
}

.field-error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0;
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
