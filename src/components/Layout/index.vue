<template>
  <div class="trae-layout">
    <header class="trae-titlebar">
    </header>

    <div class="trae-body">
      <Sidebar />
      
      <main class="trae-main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';

// Electron 窗口控制
const handleMinimize = () => window.wts?.windowControl?.minimize();
const handleMaximize = () => window.wts?.windowControl?.maximize();
const handleClose = () => window.wts?.windowControl?.close();
</script>

<style scoped>
.trae-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #FFFFFF;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 顶部系统栏 */
.trae-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFAFA; /* 与侧边栏同色 */
  user-select: none;
  flex-shrink: 0;
}

.drag-region {
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.win-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.win-btn svg {
  width: 10px;
  height: 10px;
}

.win-btn:hover { background: #E5E7EB; }
.close-btn:hover { background: #E81123; color: white; }

.trae-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.trae-main-content {
  flex: 1;
  position: relative;
  background: #FFFFFF;
  border-top-left-radius: 8px; /* 产生类似 Mac 的内嵌卡片感 */
  border-top: 1px solid #E5E7EB;
  border-left: 1px solid #E5E7EB;
  box-shadow: -4px 0 15px rgba(0,0,0,0.02);
  overflow: hidden;
}
</style>