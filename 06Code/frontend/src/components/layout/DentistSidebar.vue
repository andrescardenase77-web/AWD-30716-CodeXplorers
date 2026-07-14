<template>
  <div>
    <aside class="admin-sidebar d-none d-lg-block">
      <nav class="admin-sidebar__nav">
        <RouterLink
          v-for="link in navigationLinks"
          :key="link.name"
          :to="link.route"
          class="admin-sidebar__link"
          active-class="admin-sidebar__link--active"
        >
          <span class="admin-sidebar__link-icon" v-html="link.icon"></span>
          <span class="admin-sidebar__link-label">{{ link.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div
      id="dentistSidebarOffcanvas"
      class="offcanvas offcanvas-start d-lg-none"
      tabindex="-1"
      aria-labelledby="dentistSidebarOffcanvasLabel"
    >
      <div class="offcanvas-header gradient-header">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tooth text-white fs-4"></i>
          <h5 id="dentistSidebarOffcanvasLabel" class="text-white fw-bold m-0">Fabula Dental</h5>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body p-0">
        <nav class="admin-sidebar__nav">
          <RouterLink
            v-for="link in navigationLinks"
            :key="`mobile-${link.name}`"
            :to="link.route"
            class="admin-sidebar__link"
            active-class="admin-sidebar__link--active"
            @click="closeOffcanvas"
          >
            <span class="admin-sidebar__link-icon" v-html="link.icon"></span>
            <span class="admin-sidebar__link-label">{{ link.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Offcanvas } from 'bootstrap'

function closeOffcanvas() {
  const el = document.getElementById('dentistSidebarOffcanvas')
  if (el) {
    const instance = Offcanvas.getInstance(el)
    if (instance) instance.hide()
  }
}

const navigationLinks = [
  {
    name: 'patients',
    label: 'Registro de Pacientes',
    route: '/dentist/patients',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-3a4 4 0 100-8 4 4 0 000 8zm6 0a3 3 0 100-6 3 3 0 000 6z"/></svg>'
  },
  {
    name: 'patient-register',
    label: 'Nuevo Paciente',
    route: '/dentist/patient-register',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>'
  },
  {
    name: 'pediatric-category',
    label: 'Categoría Pediátrica',
    route: '/dentist/pediatric-category',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14c3.866 0 7 1.79 7 4v1H5v-1c0-2.21 3.134-4 7-4zm0-2a4 4 0 100-8 4 4 0 000 8z"/></svg>'
  },
  {
    name: 'birthday-calculator',
    label: 'Verificación de Cumpleaños',
    route: '/dentist/birthday-check',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'
  },
  {
    name: 'consultation-time',
    label: 'Tiempo de Consulta',
    route: '/dentist/consultation-time',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },
  {
    name: 'legal-representative',
    label: 'Representante Legal',
    route: '/dentist/legal-representative',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6a2 2 0 012-2z"/></svg>'
  }
]
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: 256px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  box-shadow: 2px 0 12px rgba(0, 82, 204, 0.06);
  overflow-y: auto;
  z-index: 900;
}

.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.25rem;
}

.admin-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: var(--border-radius-sm);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background var(--transition-base), color var(--transition-base);
  white-space: nowrap;
  overflow: hidden;
}

.admin-sidebar__link:hover {
  background: rgba(0, 82, 204, 0.06);
  color: var(--color-primary-start);
}

.admin-sidebar__link--active {
  background: rgba(0, 82, 204, 0.1);
  color: var(--color-primary-start);
}

.admin-sidebar__link-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.admin-sidebar__link-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
