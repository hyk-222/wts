<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <div class="logo-icon">
          <i class="el-icon-s-tools"></i>
        </div>
        <span class="logo-text" v-show="!isSidebarCollapsed">WTS 协同</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-item" :class="{ 'is-active': currentRoute === '/' }" @click="navigate('/')">
          <i class="el-icon-layout"></i>
          <span v-show="!isSidebarCollapsed">工作台</span>
        </div>
        <div class="nav-item" :class="{ 'is-active': currentRoute === '/tasks' }" @click="navigate('/tasks')">
          <i class="el-icon-list"></i>
          <span v-show="!isSidebarCollapsed">任务管理</span>
        </div>
      </div>

      <div class="nav-divider" v-show="!isSidebarCollapsed"></div>

      <div class="nav-section">
        <div class="section-title" v-show="!isSidebarCollapsed">技能</div>
        <div class="nav-item" :class="{ 'is-active': currentRoute === '/outline' }" @click="navigate('/outline')">
          <i class="el-icon-file-text"></i>
          <span v-show="!isSidebarCollapsed">试验大纲生成</span>
        </div>
        <div class="nav-item" :class="{ 'is-active': currentRoute === '/form' }" @click="navigate('/form')">
          <i class="el-icon-edit"></i>
          <span v-show="!isSidebarCollapsed">表单生成</span>
        </div>
      </div>

      <div class="nav-divider" v-show="!isSidebarCollapsed"></div>

      <div class="nav-section">
        <div class="section-title" v-show="!isSidebarCollapsed">任务列表</div>
        <div class="nav-item has-sub">
          <div class="nav-item-content" @click="toggleSubMenu('history')">
            <i class="el-icon-history"></i>
            <span v-show="!isSidebarCollapsed">历史处理任务</span>
            <i v-show="!isSidebarCollapsed" class="el-icon-arrow-down sub-arrow" :class="{ 'is-rotated': expandedSections.history }"></i>
          </div>
          <div v-show="!isSidebarCollapsed && expandedSections.history" class="sub-menu">
            <div class="sub-item">已完成任务</div>
            <div class="sub-item">进行中任务</div>
            <div class="sub-item">待处理任务</div>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="nav-item" @click="handleLogout">
        <i class="el-icon-switch-button"></i>
        <span v-show="!isSidebarCollapsed">退出登录</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const isSidebarCollapsed = computed(() => appStore.isSidebarCollapsed.value)

const currentRoute = computed(() => router.currentRoute.value.path)

const expandedSections = ref({
  history: false
})

const toggleSubMenu = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const navigate = (path) => {
  router.push(path)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar.is-collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.is-active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.nav-item i {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-item span {
  font-size: 14px;
  flex: 1;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.has-sub {
  padding: 0;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item-content:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sub-arrow {
  transition: transform 0.2s ease;
  margin-left: auto;
}

.sub-arrow.is-rotated {
  transform: rotate(180deg);
}

.sub-menu {
  padding-left: 24px;
  margin-top: 4px;
}

.sub-item {
  padding: 10px 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.sub-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-footer {
  padding: 16px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>