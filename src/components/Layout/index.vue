<template>
  <div class="app-layout">
    <header class="global-titlebar">
      <div class="drag-region">WTS 协同工作平台</div>
      <div class="window-controls">
        <div class="control-btn" @click="handleMinimize"><i class="el-icon-minus"></i></div>
        <div class="control-btn" @click="handleMaximize"><i class="el-icon-full-screen"></i></div>
        <div class="control-btn close-btn" @click="handleClose"><i class="el-icon-close"></i></div>
      </div>
    </header>

    <div class="layout-body">
      <Sidebar />
      
      <main class="main-content">
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

// 调用 Electron 预加载脚本暴露的窗口控制 API
const handleMinimize = () => window.wts?.windowControl?.minimize();
const handleMaximize = () => window.wts?.windowControl?.maximize();
const handleClose = () => window.wts?.windowControl?.close();
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #ffffff;
  overflow: hidden;
}

/* 全局标题栏 */
.global-titlebar {
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #f1f3f4;
  user-select: none;
  flex-shrink: 0;
}

.drag-region {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 16px;
  -webkit-app-region: drag; /* 开启 Electron 拖拽 */
  font-size: 13px;
  font-weight: 600;
  color: #5f6368;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag; /* 按钮区域不可拖拽，否则无法点击 */
}

.control-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  transition: background 0.2s;
}

.control-btn:hover { background: #f1f3f4; }
.close-btn:hover { background: #e81123; color: white; }

/* 布局主体 */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}
</style>