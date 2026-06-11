<template>
  <div class="chat-workspace">
    <!-- 顶部标题栏 -->
    <div class="workspace-header">
      <div class="collapse-btn-wrapper" @click="toggleChatSidebar">
        <i :class="isChatSidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'" class="collapse-btn"></i>
      </div>
      <div class="header-content">
        <div class="title-main">
          <span class="gradient-text">WTS 协同工作</span>
          <el-tag size="mini" effect="plain" class="version-tag">Beta</el-tag>
        </div>
        <div class="title-sub">帮你高效完成日常工作任务</div>
      </div>
      <div class="header-quick-actions">
        <el-dropdown trigger="hover" placement="bottom-end" :show-timeout="50">
          <div class="app-matrix-btn" title="AI 生态平台">
            <i class="el-icon-menu"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="ai-matrix-dropdown">
            <div class="matrix-list">
              <a href="https://deep-engine.weichai.com/" target="_blank" class="matrix-item">
                <div class="icon-box icon-dev"><i class="el-icon-cpu"></i></div>
                <span>大模型开发平台</span>
              </a>
              <a href="https://app-engine.weichai.com/" target="_blank" class="matrix-item">
                <div class="icon-box icon-app"><i class="el-icon-monitor"></i></div>
                <span>大模型应用平台</span>
              </a>
              <a href="https://k-engine.weichai.com/newclient/agent/" target="_blank" class="matrix-item">
                <div class="icon-box icon-km"><i class="el-icon-reading"></i></div>
                <span>知识管理平台</span>
              </a>
              <a href="https://code-engine.weichai.com/" target="_blank" class="matrix-item">
                <div class="icon-box icon-code"><i class="el-icon-magic-stick"></i></div>
                <span>智能编码平台</span>
              </a>
              <a href="https://data-engine.weichai.com/" target="_blank" class="matrix-item">
                <div class="icon-box icon-data"><i class="el-icon-pie-chart"></i></div>
                <span>智能问数平台</span>
              </a>
            </div>
          </el-dropdown-menu>
        </el-dropdown>
        <el-divider direction="vertical" class="header-divider"></el-divider>
        <div class="app-close-btn" title="关闭窗口">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </div>

    <!-- 主聊天容器 -->
    <div class="chat-container">
      <!-- 左侧边栏 -->
      <div class="chat-sidebar" :class="{ 'is-collapsed': isChatSidebarCollapsed }">
        <div class="sidebar-inner">
          <el-button type="primary" class="new-chat-btn" @click="startNewChat">
            <i class="el-icon-plus"></i> 发起新对话
          </el-button>
          
          <div class="sidebar-search-wrapper">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索历史记录..." 
              prefix-icon="el-icon-search" 
              size="small" 
              clearable
              class="premium-search-input"
            ></el-input>
          </div>
          
          <div class="history-list">
            <div class="empty-state-sidebar">
              <i class="el-icon-box"></i>
              <p>暂无历史记录</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-content">
        <!-- 欢迎屏幕 -->
        <WelcomeScreen 
          v-if="isNewSession" 
          :agent-types="agentTypes"
          :current-agent-type="currentAgentType"
          @toggle-agent="toggleAgent"
        />

        <!-- 聊天历史 -->
        <div 
          v-show="!isNewSession" 
          ref="chatHistoryBox"
          class="chat-history-box"
          @scroll="handleScroll"
        >
          <MessageList 
            :messages="messages"
            :loading="loading"
            @copy="copyText"
            @set-score="setMessageScore"
          />
        </div>

        <!-- 底部输入区域 -->
        <div class="chat-footer">
          <InputArea 
            :input-message="inputMessage"
            :dynamic-placeholder="dynamicPlaceholder"
            :loading="loading"
            :current-agent-type="currentAgentType"
            :agent-types="agentTypes"
            @update:input-message="inputMessage = $event"
            @send="sendMessage"
            @toggle-agent="toggleAgent"
          />
        </div>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <div 
      v-show="showScrollBottomBtn" 
      class="scroll-bottom-btn"
      @click="forceScrollToBottom"
    >
      <i class="el-icon-arrow-down"></i>
    </div>
  </div>
</template>

<script setup>import { ref } from 'vue';
import { useChat } from '@/composables/useChat';
import { useAppStore } from '@/stores/app';
import WelcomeScreen from './components/WelcomeScreen.vue';
import MessageList from './components/MessageList.vue';
import InputArea from './components/InputArea.vue';
const chat = useChat();
const appStore = useAppStore();
const searchQuery = ref('');
const isChatSidebarCollapsed = ref(true);
const chatHistoryBox = ref(null);
// 从chat composable获取状态
const messages = chat.messages;
const currentAgentType = chat.currentAgentType;
const isNewSession = chat.isNewSession;
const loading = chat.loading;
const inputMessage = chat.inputMessage;
const dynamicPlaceholder = chat.dynamicPlaceholder;
const agentTypes = chat.agentTypes;
const showScrollBottomBtn = chat.showScrollBottomBtn;
// 从chat composable获取方法
const sendMessage = chat.sendMessage;
const toggleAgent = chat.toggleAgent;
const startNewChat = chat.startNewChat;
const setMessageScore = chat.setMessageScore;
const copyText = chat.copyText;
const handleScroll = chat.handleScroll;
const forceScrollToBottom = chat.forceScrollToBottom;
// 切换聊天侧边栏
const toggleChatSidebar = () => {
 isChatSidebarCollapsed.value = !isChatSidebarCollapsed.value;
};
// 绑定聊天历史容器
const setChatHistoryBox = (el) => {
 chatHistoryBox.value = el;
};
</script>

<style scoped>
.chat-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
}

/* 顶部标题栏 */
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 20;
}

.collapse-btn-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;
}

.collapse-btn-wrapper:hover {
  background: rgba(0, 0, 0, 0.05);
}

.collapse-btn {
  font-size: 16px;
  color: #5f6368;
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gradient-text {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: transparent;
}

.title-sub {
  font-size: 13px;
  color: #9aa0a6;
  letter-spacing: 0.3px;
}

.header-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-matrix-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-matrix-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.app-matrix-btn i {
  font-size: 18px;
  color: #5f6368;
}

.header-divider {
  height: 24px;
  margin: 0 4px;
}

.app-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-close-btn:hover {
  background: rgba(234, 67, 53, 0.1);
}

.app-close-btn i {
  font-size: 16px;
  color: #5f6368;
}

.app-close-btn:hover i {
  color: #ea4335;
}

/* AI生态平台下拉菜单 */
.ai-matrix-dropdown {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: none;
  min-width: 260px;
}

.matrix-list {
  padding: 8px;
}

.matrix-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #3c4043;
  text-decoration: none;
}

.matrix-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.icon-dev {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-app {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.icon-km {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.icon-code {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.icon-data {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

/* 主聊天容器 */
.chat-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧边栏 */
.chat-sidebar {
  width: 280px;
  background: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  transition: width 0.35s cubic-bezier(0.2, 0, 0, 1);
}

.chat-sidebar.is-collapsed {
  width: 64px;
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 500;
}

.sidebar-search-wrapper {
  margin-bottom: 16px;
}

.premium-search-input {
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9aa0a6;
}

.empty-state-sidebar i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-sidebar p {
  font-size: 13px;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}

/* 聊天历史区域 */
.chat-history-box {
  flex: 1;
  overflow-y: auto;
  padding: 30px 40px;
  scroll-behavior: smooth;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
}

/* 底部输入区域 */
.chat-footer {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%);
  padding: 10px 110px 24px;
  position: relative;
  z-index: 10;
}

/* 滚动到底部按钮 */
.scroll-bottom-btn {
  position: fixed;
  bottom: 100px;
  right: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.scroll-bottom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.scroll-bottom-btn i {
  font-size: 20px;
  color: #5f6368;
}
</style>