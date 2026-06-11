<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const isSidebarCollapsed = computed(() => appStore.isSidebarCollapsed.value)
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 64px;
}
</style>