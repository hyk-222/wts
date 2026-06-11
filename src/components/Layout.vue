<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['logout', 'navigate'])
const userStore = useUserStore()

const activeMenu = ref('dashboard')
const expandedSections = ref({
  skills: true,
  taskList: true
})

const handleNavClick = (id) => {
  activeMenu.value = id
  emit('navigate', id)
}

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const handleLogout = () => {
  userStore.logout()
  emit('logout')
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const showUserMenu = ref(false)
</script>

<template>
  <div class="layout-container">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-content">
        <!-- 默认菜单 - 工作台、任务管理 -->
        <div class="sidebar-section default-menu">
          <button 
            class="task-item main-item"
            :class="{ active: activeMenu === 'dashboard' }"
            @click="handleNavClick('dashboard')"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>工作台</span>
          </button>
          <button 
            class="task-item main-item"
            :class="{ active: activeMenu === 'tasks' }"
            @click="handleNavClick('tasks')"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>任务管理</span>
          </button>
        </div>

        <!-- 技能类别 -->
        <div class="sidebar-section">
          <button class="section-header" @click="toggleSection('skills')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>技能</span>
            <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ expanded: expandedSections.skills }">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div v-show="expandedSections.skills" class="section-content task-list">
            <button
              class="task-item sub-item"
              :class="{ active: activeMenu === 'outline' }"
              @click="handleNavClick('outline')"
            >
              <div class="task-status active"></div>
              <span>试验大纲生成</span>
            </button>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="sidebar-section">
          <button class="section-header" @click="toggleSection('taskList')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>任务列表</span>
            <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ expanded: expandedSections.taskList }">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div v-show="expandedSections.taskList" class="section-content task-list">
            <button 
              class="task-item sub-item"
              :class="{ active: activeMenu === 'history' }"
              @click="handleNavClick('history')"
            >
              <div class="task-status"></div>
              <span>历史处理任务</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-profile" @click="toggleUserMenu">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userStore.state.nickName || userStore.state.name || '用户' }}</span>
            <span class="user-role">{{ userStore.state.roles?.[0] === 'ROLE_DEFAULT' ? '普通用户' : userStore.state.roles?.[0] || '普通用户' }}</span>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
    </aside>

    <!-- 用户菜单弹窗 -->
    <div v-if="showUserMenu" class="user-menu-overlay" @click="showUserMenu = false"></div>
    
    <div class="user-menu" :class="{ show: showUserMenu }">
      <div class="menu-header">
        <div class="menu-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="menu-user-info">
          <span class="menu-user-name">{{ userStore.state.nickName || userStore.state.name || '用户' }}</span>
          <span class="menu-user-email">{{ userStore.state.name || 'user' }}@weichai.com</span>
        </div>
      </div>
      <div class="menu-divider"></div>
      <button class="menu-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
        </svg>
        <span>个人设置</span>
      </button>
      <button class="menu-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 18H4v-3.5a2.121 2.121 0 0 1 3-3h1.5"/>
        </svg>
        <span>切换账号</span>
      </button>
      <div class="menu-divider"></div>
      <button class="menu-item logout-item" @click="handleLogout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>退出登录</span>
      </button>
    </div>

    <!-- 右侧主内容区 -->
    <main class="content-area">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
/* 全局布局 */
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* 左侧边栏 */
.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 12px;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 11px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-header svg {
  width: 12px;
  height: 12px;
}

.section-menu {
  margin-left: auto;
  padding: 2px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: #999;
  cursor: pointer;
}

.section-menu:hover {
  background: #f5f5f5;
}

.section-menu svg {
  width: 12px;
  height: 12px;
}

.section-content {
  padding: 4px 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 150ms ease;
}

.task-item:hover {
  background: #f5f5f5;
}

.task-item.active {
  background: #eef2ff;
  color: #6366f1;
}

.task-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
}

.task-status.active {
  background: #6366f1;
}

/* 底部用户信息 */
.sidebar-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 150ms ease;
}

.user-profile:hover {
  background: #f5f5f5;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar svg {
  width: 18px;
  height: 18px;
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.85);
}

.user-role {
  display: block;
  font-size: 11px;
  color: #999;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  opacity: 0.4;
  transition: transform 150ms ease;
  flex-shrink: 0;
}

.user-profile:hover .arrow-icon {
  transform: rotate(180deg);
}

/* 用户菜单 */
.user-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
}

.user-menu {
  position: fixed;
  bottom: 80px;
  left: 16px;
  width: 220px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px) scale(0.95);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 201;
  overflow: hidden;
}

.user-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.menu-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.menu-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.menu-user-info {
  flex: 1;
}

.menu-user-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.menu-user-email {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
  color: #334155;
  font-size: 13px;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.menu-item.logout-item {
  color: #ef4444;
}

.menu-item.logout-item svg {
  color: #ef4444;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .section-header span,
  .task-item span,
  .user-info,
  .arrow-icon {
    display: none;
  }
  
  .user-profile {
    justify-content: center;
  }
}
</style>
