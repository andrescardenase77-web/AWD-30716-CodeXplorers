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
  margin-left: 256px;
  padding: 2rem;
  flex: 1;
  background-color: var(--color-background);
  min-height: calc(100vh - 64px);
}
</style>
