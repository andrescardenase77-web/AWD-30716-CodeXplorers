<template>
  <div class="admin-layout">
    <AdminNavbar />
    <AdminSidebar />
    <main class="admin-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AdminNavbar from '@/components/layout/AdminNavbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
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
