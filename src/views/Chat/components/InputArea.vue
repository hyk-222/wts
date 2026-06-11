<template>
  <div class="chat-input-area">
    <!-- 智能体切换 -->
    <div class="agent-switch-container">
      <div class="agent-switch">
        <div 
          v-for="agent in agentTypes" 
          :key="agent.type"
          class="agent-option"
          :class="{ 'is-selected': currentAgentType === agent.type }"
          @click="$emit('toggle-agent', agent.type)"
        >
          <i :class="getAgentIcon(agent.icon)"></i>
          <span>{{ agent.name }}</span>
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="gemini-input-container" :class="{ 'is-focused': isFocused }">
      <textarea 
        class="chat-input"
        :placeholder="dynamicPlaceholder"
        :value="inputMessage"
        @input="$emit('update:input-message', $event.target.value)"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
        rows="1"
      ></textarea>
      
      <div v-if="loading" class="stop-icon-wrapper">
        <div class="stop-square"></div>
      </div>
      
      <div 
        class="send-icon-wrapper"
        :class="{ 'is-active': inputMessage.trim() && !loading }"
        @click="handleSend"
      >
        <i class="el-icon-send"></i>
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="footer-disclaimer">
      <span>WTS 协同工作由人工智能提供支持，确保信息安全可靠</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  inputMessage: {
    type: String,
    default: ''
  },
  dynamicPlaceholder: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentAgentType: {
    type: String,
    default: 'default'
  },
  agentTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:input-message', 'send', 'toggle-agent'])

const isFocused = ref(false)

const getAgentIcon = (icon) => {
  const iconMap = {
    device: 'el-icon-cpu',
    fault: 'el-icon-stethoscope',
    business: 'el-icon-briefcase'
  }
  return iconMap[icon] || 'el-icon-help'
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}

const handleSend = () => {
  if (!loading) {
    emit('send')
  }
}
</script>

<style scoped>
.chat-input-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 智能体切换 */
.agent-switch-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.agent-switch {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #f1f3f4;
  border-radius: 10px;
}

.agent-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #5f6368;
}

.agent-option:hover {
  background: rgba(0, 0, 0, 0.05);
}

.agent-option.is-selected {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #3b82f6;
}

.agent-option i {
  font-size: 14px;
}

/* 输入框容器 */
.gemini-input-container {
  display: flex;
  align-items: flex-end;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 28px;
  padding: 12px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.gemini-input-container.is-focused {
  border-color: #1a73e8;
  box-shadow: 0 6px 24px rgba(26, 115, 232, 0.12);
  transform: translateY(-2px);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  resize: none;
  line-height: 1.6;
  color: #3c4043;
  min-height: 24px;
  max-height: 200px;
}

.chat-input::placeholder {
  color: #9aa0a6;
}

/* 停止按钮 */
.stop-icon-wrapper {
  margin-left: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e8f0fe;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.stop-icon-wrapper:hover {
  background-color: #d2e3fc;
  transform: scale(1.05);
}

.stop-square {
  width: 12px;
  height: 12px;
  background-color: #1a73e8;
  border-radius: 2px;
}

/* 发送按钮 */
.send-icon-wrapper {
  margin-left: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  color: #b0b5ba;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f1f3f4;
}

.send-icon-wrapper.is-active {
  color: #fff;
  background-color: #1a73e8;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
}

.send-icon-wrapper.is-active:hover {
  background-color: #1557b0;
  box-shadow: 0 6px 16px rgba(26, 115, 232, 0.4);
  transform: scale(1.05);
}

.send-icon-wrapper i {
  font-size: 16px;
}

/* 免责声明 */
.footer-disclaimer {
  text-align: center;
  font-size: 12px;
  color: #9aa0a6;
  letter-spacing: 0.3px;
}
</style>