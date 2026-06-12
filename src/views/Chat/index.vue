<template>
  <div class="chat-workspace">
    <div class="chat-history-sidebar" :class="{ 'is-collapsed': isChatSidebarCollapsed }">
      <div class="sidebar-inner">
        <div class="sidebar-header">
          <el-button type="primary" class="new-chat-btn" @click="startNewChat">
            <i class="el-icon-plus"></i> 发起新对话
          </el-button>
          <div class="collapse-trigger" @click="isChatSidebarCollapsed = !isChatSidebarCollapsed">
            <i class="el-icon-s-fold"></i>
          </div>
        </div>
        
        <div class="sidebar-search-wrapper" v-show="!isChatSidebarCollapsed">
          <el-input v-model="searchQuery" placeholder="搜索历史..." prefix-icon="el-icon-search" size="small"></el-input>
        </div>
        
        <div class="history-list" v-show="!isChatSidebarCollapsed">
          <div class="empty-state-sidebar">
            <i class="el-icon-box"></i>
            <p>暂无历史记录</p>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-main-area">
      <div class="chat-top-actions">
        <div class="expand-trigger" v-if="isChatSidebarCollapsed" @click="isChatSidebarCollapsed = false">
          <i class="el-icon-s-unfold"></i>
        </div>
        <div class="spacer"></div>
        <el-tag size="small" effect="plain">Beta</el-tag>
      </div>

      <WelcomeScreen 
        v-if="chatStore.isNewSession" 
        :current-agent-type="chatStore.currentAgentType"
        @toggle-agent="chatStore.setAgentType"
      />

      <div v-show="!chatStore.isNewSession" class="chat-flow-container" ref="chatFlowBox" @scroll="handleScroll">
        <MessageList :messages="chatStore.messages" />
      </div>

      <div class="chat-input-wrapper">
        <InputArea 
          :current-agent-type="chatStore.currentAgentType"
          :loading="chatStore.isGenerating"
          @send="handleSendMessage"
          @toggle-agent="chatStore.setAgentType"
        />
      </div>

      <div v-show="showScrollBtn" class="scroll-bottom-btn" @click="scrollToBottom(true)">
        <i class="el-icon-arrow-down"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';
import WelcomeScreen from './components/WelcomeScreen.vue';
import MessageList from './components/MessageList.vue';
import InputArea from './components/InputArea.vue';

const chatStore = useChatStore();

// 内部 UI 状态
const isChatSidebarCollapsed = ref(false);
const searchQuery = ref('');
const chatFlowBox = ref(null);
const showScrollBtn = ref(false);

const startNewChat = () => {
  chatStore.clearMessages();
  chatStore.setAgentType('default');
};

const handleSendMessage = async (text) => {
  chatStore.addMessage({ id: Date.now(), role: 'user', content: text });
  chatStore.setGeneratingStatus(true);
  
  const aiMsgId = Date.now() + 1;
  chatStore.addMessage({ id: aiMsgId, role: 'ai', content: '', isLoading: true });
  
  await nextTick();
  scrollToBottom(true);

  // 模拟大模型请求延迟
  setTimeout(() => {
    const msg = chatStore.messages.find(m => m.id === aiMsgId);
    if (msg) {
      msg.isLoading = false;
      msg.content = `我已收到您的请求："${text}"。正在调用相关后台服务进行处理...`;
    }
    chatStore.setGeneratingStatus(false);
    scrollToBottom(true);
  }, 1500);
};

const scrollToBottom = (smooth = false) => {
  if (chatFlowBox.value) {
    chatFlowBox.value.scrollTo({
      top: chatFlowBox.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

const handleScroll = (e) => {
  const el = e.target;
  showScrollBtn.value = (el.scrollHeight - el.scrollTop - el.clientHeight) > 100;
};
</script>

<style scoped>
.chat-workspace {
  display: flex;
  height: 100%;
  background: #ffffff;
}

/* 内部聊天记录侧边栏 */
.chat-history-sidebar {
  width: 260px;
  background: #f8f9fa;
  border-right: 1px solid #f1f3f4;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  flex-direction: column;
}

.chat-history-sidebar.is-collapsed {
  width: 0;
  border: none;
  overflow: hidden;
}

.sidebar-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 260px; /* 防止折叠时文字换行挤压 */
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.new-chat-btn {
  flex: 1;
  border-radius: 8px;
}

.collapse-trigger, .expand-trigger {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  color: #5f6368;
  transition: background 0.2s;
}
.collapse-trigger:hover, .expand-trigger:hover { background: #e8eaed; }

/* 右侧对话主区 */
.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.chat-top-actions {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
.spacer { flex: 1; }

.chat-flow-container {
  flex: 1;
  overflow-y: auto;
  padding: 60px 10% 20px; /* 居中阅读体验 */
  scroll-behavior: smooth;
}

.chat-input-wrapper {
  padding: 0 10% 24px; /* 与聊天流对齐 */
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 30%);
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 100px;
  right: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
}
</style>