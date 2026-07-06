<template>
  <div class="landing-wrapper">
    <header class="landing-header gradient-header">
      <nav class="landing-nav container">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tooth text-white fs-3"></i>
          <span class="fs-4 fw-bold text-white text-nowrap">Fábula Dental</span>
        </div>
        <RouterLink :to="{ name: 'login' }" class="btn-primary-gradient btn-outlined-white">
          Iniciar Sesión
        </RouterLink>
      </nav>
    </header>

    <main class="landing-main">
      <section class="hero-section container">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Clínica Odontológica Pediátrica
        </div>
        <h1 class="hero-title">
          Bienvenidos a
          <span class="brand-name">Fábula Dental</span>
        </h1>
        <p class="hero-subtitle">
          Cuidamos la salud bucal de los más pequeños con amor, tecnología y un toque mágico.
          Administra citas, pacientes y tratamientos desde un solo lugar.
        </p>
        <div class="hero-actions">
          <RouterLink :to="{ name: 'login' }" class="btn-primary-gradient btn-large">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Acceder al Sistema
          </RouterLink>
        </div>
      </section>

      <section class="features-section container">
        <div class="features-grid">
          <div class="feature-card card-surface" v-for="feature in features" :key="feature.title">
            <div class="feature-icon-wrapper" :style="{ background: feature.iconBg }">
              <span class="feature-icon" v-html="feature.icon"></span>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-tooth text-white fs-3"></i>
          <span class="fs-4 fw-bold text-white text-nowrap">Fábula Dental</span>
        </div>
        <p class="footer-copy">© {{ currentYear }} Fábula Dental. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const currentYear = computed(() => new Date().getFullYear())

const features = [
  {
    title: 'Gestión de Pacientes',
    description: 'Registra y administra el historial clínico de cada niño de forma rápida y segura.',
    icon: '<i class="bi bi-people text-white fs-4"></i>',
    iconBg: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)'
  },
  {
    title: 'Gestión de Pagos',
    description: 'Registra los pagos, depósitos y mantén el control de la facturación de la clínica.',
    icon: '<i class="bi bi-cash-coin text-white fs-4"></i>',
    iconBg: 'linear-gradient(135deg, #0073e6 0%, #0052cc 100%)'
  },
  {
    title: 'Control de Suministros',
    description: 'Administra el inventario médico, controla el stock y recibe alertas financieras y de caducidad.',
    icon: '<i class="bi bi-box-seam text-white fs-4"></i>',
    iconBg: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)'
  }
]
</script>

<style scoped>
.landing-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(0, 61, 153, 0.25);
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.landing-logo {
  height: 52px;
  width: auto;
  border-radius: 8px;
  object-fit: contain;
}

.btn-outlined-white {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 2px solid rgba(255, 255, 255, 0.7) !important;
  box-shadow: none !important;
  backdrop-filter: blur(4px);
}

.btn-outlined-white:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  border-color: #ffffff !important;
}

.landing-main {
  flex: 1;
}

.hero-section {
  padding: 5rem 1.5rem 3rem;
  text-align: center;
  max-width: 800px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 82, 204, 0.08);
  border: 1.5px solid rgba(0, 82, 204, 0.2);
  color: var(--color-primary-start);
  border-radius: 50px;
  padding: 0.35rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-start);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 900;
  line-height: 1.15;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

.brand-name {
  display: block;
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-large {
  padding: 0.85rem 2.25rem !important;
  font-size: 1.05rem !important;
  border-radius: 14px !important;
}

.features-section {
  padding: 2rem 1.5rem 5rem;
  max-width: 1100px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 2rem;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 0.6rem;
}

.feature-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.landing-footer {
  background: var(--color-text-primary);
  padding: 2rem 1.5rem;
}

.landing-footer .container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  height: 44px;
  width: auto;
  border-radius: 6px;
  opacity: 0.9;
}

.footer-copy {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.82rem;
  margin: 0;
}
</style>
