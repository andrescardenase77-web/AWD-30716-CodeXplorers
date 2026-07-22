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
      id="receptionistSidebarOffcanvas"
      class="offcanvas offcanvas-start d-lg-none"
      tabindex="-1"
      aria-labelledby="receptionistSidebarOffcanvasLabel"
    >
      <div class="offcanvas-header gradient-header">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tooth text-white fs-4"></i>
          <h5 id="receptionistSidebarOffcanvasLabel" class="text-white fw-bold m-0">Fábula Dental</h5>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
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
  const el = document.getElementById('receptionistSidebarOffcanvas')
  if (el) {
    const instance = Offcanvas.getInstance(el)
    if (instance) instance.hide()
  }
}

const navigationLinks = [
  {
    name: 'payments',
    label: 'Gestión de Pagos',
    route: '/receptionist/payments',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>'
  },
  {
    name: 'payment-register',
    label: 'Registrar Pago',
    route: '/receptionist/payment-register',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>'
  },
  {
    name: 'senior-discount',
    label: 'Descuento Adulto Mayor',
    route: '/receptionist/senior-discount',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m5.99 5h.01M3 21h18M12 3v18"/></svg>'
  },
  {
    name: 'contact-priority',
    label: 'Prioridad de Contacto',
    route: '/receptionist/contact-priority',
    icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>'
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
