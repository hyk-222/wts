<template>
  <div class="message-list">
    <TransitionGroup name="msg-slide">
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="message-item"
        :class="[`msg-${msg.role}`]"
      >
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="user-message">
          <div class="message-content">
            <p>{{ msg.content }}</p>
          </div>
          <div class="message-meta">
            <span class="timestamp">{{ msg.timestamp }}</span>
          </div>
        </div>

        <!-- AI消息 -->
        <div v-else class="ai-message">
          <div class="ai-avatar">
            <i class="el-icon-s-tools"></i>
          </div>
          <div class="ai-content-wrapper">
            <!-- 加载状态 -->
            <div v-if="msg.isLoading" class="loading-message">
              <div class="thinking-indicator">
                <span class="thinking-text">{{ msg.thinkingText }}</span>
                <span class="thinking-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </span>
              </div>
            </div>

            <!-- 内容 -->
            <div v-else class="message-content">
              <p>{{ msg.content }}</p>
            </div>

            <!-- 建议按钮 -->
            <div v-if="msg.suggestions && msg.suggestions.length > 0" class="suggestions-bar">
              <button 
                v-for="suggestion in msg.suggestions" 
                :key="suggestion.action"
                class="suggest-btn"
                @click="$emit('handle-suggestion', suggestion)"
              >
                {{ suggestion.text }}
              </button>
            </div>

            <!-- 反馈区域 -->
            <div class="ai-feedback-section">
              <div class="action-btn" :class="{ 'is-active': msg.score === 1 }" @click="$emit('set-score', msg.id, 1)">
                <i class="el-icon-thumbs-up"></i>
                <span>赞同</span>
              </div>
              <div class="action-btn" :class="{ 'is-active': msg.score === -1 }" @click="$emit('set-score', msg.id, -1)">
                <i class="el-icon-thumbs-down"></i>
                <span>不赞同</span>
              </div>
              <div class="action-btn" @click="$emit('copy', msg.content)">
                <i class="el-icon-copy-document"></i>
                <span>复制</span>
              </div>
            </div>

            <div class="message-meta">
              <span class="timestamp">{{ msg.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- 正在输入提示 -->
    <div v-if="loading" class="typing-message">
      <div class="typing-avatar">
        <i class="el-icon-s-tools"></i>
      </div>
      <div class="typing-content">
        <div class="typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
        <span class="typing-text">正在思考...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['copy', 'set-score', 'handle-suggestion'])
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message-item {
  display: flex;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息 */
.user-message {
  justify-content: flex-end;
}

.user-message .message-content {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  padding: 14px 18px;
  border-radius: 18px 18px 4px 18px;
  max-width: 70%;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.user-message .message-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

/* AI消息 */
.ai-message {
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}

.ai-content-wrapper {
  flex: 1;
}

.ai-message .message-content {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 14px 18px;
  border-radius: 4px 18px 18px 18px;
  max-width: 80%;
}

.ai-message .message-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #3c4043;
  white-space: pre-wrap;
}

/* 加载状态 */
.loading-message {
  padding: 14px 18px;
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 4px 18px 18px 18px;
  max-width: 80%;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thinking-text {
  font-size: 14px;
  color: #5f6368;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9aa0a6;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.thinking-dots .dot:nth-child(1) { animation-delay: 0s; }
.thinking-dots .dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* 建议按钮栏 */
.suggestions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.suggest-btn {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggest-btn:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
  color: #3b82f6;
}

/* 反馈区域 */
.ai-feedback-section {
  margin-top: 12px;
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  color: #9aa0a6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #5f6368;
}

.action-btn.is-active {
  color: #1a73e8;
  background: rgba(26, 115, 232, 0.1);
}

.action-btn i {
  font-size: 14px;
}

/* 消息元信息 */
.message-meta {
  margin-top: 4px;
}

.timestamp {
  font-size: 11px;
  color: #9aa0a6;
}

.user-message .message-meta {
  text-align: right;
}

/* 正在输入提示 */
.typing-message {
  display: flex;
  gap: 12px;
  animation: fadeInUp 0.3s ease;
}

.typing-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-bubble {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
}

.typing-bubble .typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9aa0a6;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-bubble .typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-bubble .typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble .typing-dot:nth-child(3) { animation-delay: 0.4s; }

.typing-text {
  font-size: 13px;
  color: #9aa0a6;
}

/* 消息滑动动画 */
.msg-slide-enter-active {
  transition: all 0.3s ease;
}

.msg-slide-leave-active {
  transition: all 0.2s ease;
}

.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.msg-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>