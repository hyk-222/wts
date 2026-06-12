<template>
  <div class="chat-workspace">
    <div class="chat-main-area">
      <!-- 欢迎界面 -->
      <WelcomeScreen 
        v-if="chatStore.isNewSession" 
        :agent-types="chatStore.agentTypes"
        :current-agent-type="chatStore.currentAgentType"
        @toggle-agent="chatStore.setAgentType"
      />

      <!-- 消息流区域 -->
      <div v-show="!chatStore.isNewSession" class="chat-flow-container" ref="chatFlowBox" @scroll="handleScroll">
        <div class="chat-content-wrapper">
          <MessageList 
            :messages="chatStore.messages" 
            :loading="chatStore.isGenerating"
            @copy="chatStore.copyText"
            @toggle-score="handleToggleScore"
            @submit-comment="handleSubmitComment"
            @edit="handleEditMessage"
            @submit-edit="handleSubmitEdit"
            @resend="handleResendMessage"
            @switch-version="handleSwitchVersion"
            @stop-generation="chatStore.stopGeneration"
            @open-reference="handleOpenReference"
          />
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-wrapper">
        <div class="input-container-inner">
          <InputArea 
            :agent-types="chatStore.agentTypes"
            :current-agent-type="chatStore.currentAgentType"
            :loading="chatStore.isGenerating"
            :input-message="chatStore.inputMessage"
            @update:input-message="chatStore.inputMessage = $event"
            @send="handleSendMessage"
            @toggle-agent="chatStore.setAgentType"
          />
        </div>
      </div>

      <!-- 滚动到底部按钮 -->
      <Transition name="el-fade-in">
        <div v-show="showScrollBtn" class="scroll-bottom-btn" @click="scrollToBottom(true)">
          <i class="el-icon-arrow-down"></i>
        </div>
      </Transition>
    </div>

    <!-- 知识溯源弹窗 -->
    <el-dialog 
      title="知识溯源" 
      :visible.sync="showRefModal" 
      width="600px"
      class="reference-modal"
    >
      <div v-if="selectedReferences && selectedReferences.length > 0" class="reference-content">
        <div class="ref-tabs">
          <el-tabs type="card" v-model="activeRefTab">
            <el-tab-pane label="引用详情" name="detail">
              <div class="ref-detail">
                <div class="detail-header">
                  <span class="doc-title">{{ selectedReferences[0]?.document_name || '未知文档' }}</span>
                  <span class="doc-source">来源: {{ selectedReferences[0]?.dataset_name }}</span>
                </div>
                <div class="detail-body">
                  <div class="detail-section">
                    <span class="section-title">相似度</span>
                    <span class="section-value">{{ selectedReferences[0]?.similarity || 0 }}%</span>
                  </div>
                  <div class="detail-section">
                    <span class="section-title">引用内容</span>
                    <p class="section-text">{{ selectedReferences[0]?.content || '暂无内容' }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="所有引用" name="all">
              <div class="ref-list">
                <div 
                  v-for="ref in selectedReferences" 
                  :key="ref.id" 
                  class="ref-item"
                  :class="{ active: ref.id === activeRefId }"
                  @click="activeRefId = ref.id"
                >
                  <span class="ref-id">[{{ ref.id }}]</span>
                  <span class="ref-name">{{ ref.document_name || '未知文档' }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { ElMessage } from 'element-plus';
import WelcomeScreen from './components/WelcomeScreen.vue';
import MessageList from './components/MessageList.vue';
import InputArea from './components/InputArea.vue';

const chatStore = useChatStore();
const chatFlowBox = ref(null);
const showScrollBtn = ref(false);
const showRefModal = ref(false);
const selectedReferences = ref([]);
const activeRefTab = ref('detail');
const activeRefId = ref(null);

// 发送消息
const handleSendMessage = async () => {
  if (!chatStore.inputMessage.trim()) return;
  await chatStore.sendMessage(chatStore.inputMessage);
  chatStore.inputMessage = '';
  await nextTick();
  scrollToBottom(true);
};

// 切换版本
const handleSwitchVersion = (msg, direction) => {
  chatStore.switchAnswerVersion(msg, direction);
};

// 切换评分
const handleToggleScore = (msg, score) => {
  chatStore.toggleMessageScore(msg, score);
};

// 提交反馈
const handleSubmitComment = async (msg) => {
  await chatStore.submitFeedback(msg);
};

// 编辑消息
const handleEditMessage = (msg) => {
  chatStore.startEditMessage(msg);
};

// 提交编辑
const handleSubmitEdit = async (msg, index) => {
  await chatStore.submitEditMessage(msg, index);
  await nextTick();
  scrollToBottom(true);
};

// 重新发送
const handleResendMessage = async (msg, index) => {
  await chatStore.resendMessage(msg, index);
  await nextTick();
  scrollToBottom(true);
};

// 打开参考文献
const handleOpenReference = (refId, refs) => {
  selectedReferences.value = refs;
  activeRefId.value = refId;
  showRefModal.value = true;
};

// 滚动到底部
const scrollToBottom = (smooth = false) => {
  if (chatFlowBox.value) {
    chatFlowBox.value.scrollTo({
      top: chatFlowBox.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

// 滚动事件处理
const handleScroll = (e) => {
  const el = e.target;
  showScrollBtn.value = (el.scrollHeight - el.scrollTop - el.clientHeight) > 100;
};

// 监听消息变化，自动滚动
watch(() => chatStore.messages.length, async () => {
  await nextTick();
  if (!chatStore.isNewSession) {
    scrollToBottom(false);
  }
});

onMounted(() => {
  if (!chatStore.isNewSession) {
    scrollToBottom(false);
  }
});
</script>

<style scoped>
.chat-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
}

.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.chat-flow-container {
  flex: 1;
  overflow-y: auto;
  padding: 40px 0;
  scroll-behavior: smooth;
}

.chat-content-wrapper {
  min-height: 100%;
}

.chat-input-wrapper {
  padding: 12px 0 24px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%);
}

.input-container-inner {
  max-width: 840px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 限制内容流的最大宽度，保障专业客户端的阅读呼吸感 */
:deep(.message-item) {
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 120px;
  right: 40px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  transition: all 0.2s ease;
  z-index: 99;
}

.scroll-bottom-btn:hover {
  background: #F3F4F6;
  color: #111827;
}

/* 知识溯源弹窗 */
.reference-modal {
  border-radius: 12px;
}

.reference-content {
  padding: 16px 0;
}

.ref-tabs {
  margin-top: 16px;
}

.ref-detail {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-header {
  margin-bottom: 16px;
}

.doc-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.doc-source {
  font-size: 12px;
  color: #6b7280;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
}

.section-title {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-bottom: 8px;
}

.section-value {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
}

.section-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  word-break: break-all;
}

.ref-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ref-list .ref-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.ref-list .ref-item:hover {
  background: #eff6ff;
}

.ref-list .ref-item.active {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.ref-id {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
}

.ref-name {
  font-size: 14px;
  color: #374151;
}
</style>