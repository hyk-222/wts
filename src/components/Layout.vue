<template>
  <div class="layout-wrapper">
    <header class="custom-titlebar">
      <div class="drag-region">WTS</div>
      <div class="window-controls">
        <div class="control-btn" @click="handleMinimize"><i class="el-icon-minus"></i></div>
        <div class="control-btn" @click="handleMaximize"><i class="el-icon-full-screen"></i></div>
        <div class="control-btn close-btn" @click="handleClose"><i class="el-icon-close"></i></div>
      </div>
    </header>

    <div class="layout-main">
      <aside class="compact-sidebar">
        <div class="nav-top">
          <div class="nav-item" :class="{ active: activeMenu === 'dashboard' }" @click="handleNavClick('dashboard')" title="智能对话">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="nav-item" :class="{ active: activeMenu === 'outline' }" @click="handleNavClick('outline')" title="大纲生成">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
        </div>
        
        <div class="nav-bottom">
          <div class="user-avatar-btn" @click="toggleUserMenu">
            <span class="user-initial">{{ userStore.state.name?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['logout', 'navigate'])
const userStore = useUserStore()
const activeMenu = ref('dashboard')

const handleNavClick = (id) => {
  activeMenu.value = id
  emit('navigate', id)
}

// 窗口控制逻辑
const handleMinimize = () => window.wts.windowControl.minimize()
const handleMaximize = () => window.wts.windowControl.maximize()
const handleClose = () => window.wts.windowControl.close()
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-bg-card);
}

.custom-titlebar {
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.drag-region {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 16px;
  -webkit-app-region: drag; /* 开启 Electron 拖拽 */
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
  height: 100%;
}

.control-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background 0.2s;
}

.control-btn:hover { background: rgba(0, 0, 0, 0.05); }
.close-btn:hover { background: #e81123; color: white; }

.layout-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.compact-sidebar {
  width: 64px;
  background: var(--color-bg-page);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.nav-item {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.nav-item:hover { background: var(--color-border); }
.nav-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.nav-icon { width: 22px; height: 22px; }

.user-avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

.content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>