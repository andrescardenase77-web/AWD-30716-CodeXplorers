<template>
  <div class="admin-layout">
    <DentistNavbar />
    <DentistSidebar />
    <main class="admin-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import DentistNavbar from '@/components/layout/DentistNavbar.vue'
import DentistSidebar from '@/components/layout/DentistSidebar.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-layout__content {
  margin-top: 64px;
  padding: 1.25rem;
  flex: 1;
  background-color: var(--color-background);
  min-height: calc(100vh - 64px);
}

@media (min-width: 992px) {
  .admin-layout__content {
    margin-left: 256px;
    padding: 2rem;
  }
}
</style>
