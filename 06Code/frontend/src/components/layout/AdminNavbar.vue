<template>
  <header class="admin-navbar gradient-header">
    <div class="admin-navbar__inner">
      <div class="d-flex align-items-center gap-2">
        <button
          id="sidebar-toggle-btn"
          class="btn btn-link text-white p-0 me-2 d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminSidebarOffcanvas"
          aria-controls="adminSidebarOffcanvas"
        >
          <i class="bi bi-list fs-3"></i>
        </button>
        <i class="bi bi-tooth text-white fs-3"></i>
        <span class="fs-5 fw-bold text-white text-nowrap">Fábula Dental</span>
      </div>
      <span class="admin-navbar__greeting d-none d-sm-inline">Bienvenido, Administrador</span>
      <button id="logout-btn" class="admin-navbar__logout" @click="handleLogout">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="d-none d-sm-inline">Cerrar Sesión</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  localStorage.clear()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.admin-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1040;
  box-shadow: 0 2px 16px rgba(0, 61, 153, 0.25);
}

.admin-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

.admin-navbar__greeting {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.admin-navbar__logout {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background var(--transition-base);
}

.admin-navbar__logout:hover {
  background: rgba(255, 255, 255, 0.28);
}
</style>
