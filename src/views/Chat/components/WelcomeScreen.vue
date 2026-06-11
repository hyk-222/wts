<template>
  <div class="welcome-screen">
    <!-- 标题区域 -->
    <div class="welcome-header">
      <div class="avatar-container">
        <div class="avatar">
          <i class="el-icon-s-tools"></i>
        </div>
        <div class="typing-indicator" v-if="showTyping">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
      <div class="welcome-title-wrapper">
        <h1 class="welcome-title">
          <span class="title-text" ref="titleRef">{{ displayedTitle }}</span>
        </h1>
        <p class="welcome-subtitle">帮你高效完成日常工作任务</p>
      </div>
    </div>

    <!-- 智能体选择卡片 -->
    <div class="suggest-section">
      <h3 class="section-title">选择智能助手</h3>
      <div class="suggest-card-list">
        <div 
          v-for="agent in agentTypes" 
          :key="agent.type"
          class="suggest-card"
          :class="[`${agent.type}-card`, { 'is-selected': currentAgentType === agent.type }]"
          @click="$emit('toggle-agent', agent.type)"
        >
          <div class="card-icon" :style="{ backgroundColor: agent.bgColor, color: agent.color }">
            <i :class="getAgentIcon(agent.icon)"></i>
          </div>
          <div class="card-content">
            <h4 class="card-title">{{ agent.name }}</h4>
            <p class="card-desc">{{ getAgentDesc(agent.type) }}</p>
          </div>
          <div class="card-select-indicator">
            <i v-if="currentAgentType === agent.type" class="el-icon-check"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷工具停靠栏 -->
    <div class="quick-tools">
      <div class="tools-title">快捷工具</div>
      <div class="tools-scroll">
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            <i class="el-icon-link"></i>
          </div>
          <span class="tool-name">网页读取</span>
        </div>
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="el-icon-search"></i>
          </div>
          <span class="tool-name">调研分析</span>
        </div>
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            <i class="el-icon-file-excel"></i>
          </div>
          <span class="tool-name">表格分析</span>
        </div>
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
            <i class="el-icon-file-text"></i>
          </div>
          <span class="tool-name">文档总结</span>
        </div>
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;">
            <i class="el-icon-presentation"></i>
          </div>
          <span class="tool-name">PPT生成</span>
        </div>
        <div class="tool-card">
          <div class="tool-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
            <i class="el-icon-code"></i>
          </div>
          <span class="tool-name">代码生成</span>
        </div>
      </div>
    </div>

    <!-- 使用提示 -->
    <div class="usage-tips">
      <div class="tips-title">使用提示</div>
      <div class="tips-grid">
        <div class="tip-item">
          <div class="tip-icon">
            <i class="el-icon-lightbulb"></i>
          </div>
          <div class="tip-content">
            <h4>清晰描述需求</h4>
            <p>提供详细信息，获得更精准的回复</p>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <i class="el-icon-refresh"></i>
          </div>
          <div class="tip-content">
            <h4>多轮对话</h4>
            <p>支持上下文理解，可继续追问</p>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <i class="el-icon-share-alt"></i>
          </div>
          <div class="tip-content">
            <h4>导出分享</h4>
            <p>一键导出结果，方便分享协作</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue';
const props = defineProps({
 agentTypes: {
 type: Array,
 required: true
 },
 currentAgentType: {
 type: String,
 default: 'default'
 }
});
defineEmits(['toggle-agent']);
const fullTitle = 'WTS 协同工作';
const displayedTitle = ref('');
const showTyping = ref(true);
const titleRef = ref(null);
onMounted(() => {
 let index = 0;
 const typeInterval = setInterval(() => {
 if (index < fullTitle.length) {
 displayedTitle.value += fullTitle[index];
 index++;
 }
 else {
 clearInterval(typeInterval);
 setTimeout(() => {
 showTyping.value = false;
 }, 500);
 }
 }, 100);
});
const getAgentIcon = (icon) => {
 const iconMap = {
 device: 'el-icon-cpu',
 fault: 'el-icon-stethoscope',
 business: 'el-icon-briefcase'
 };
 return iconMap[icon] || 'el-icon-help';
};
const getAgentDesc = (type) => {
 const descMap = {
 device: '设备技术咨询、故障排查、性能分析',
 fault: '智能诊断、异常分析、解决方案推荐',
 business: '业务流程咨询、文档撰写、数据分析'
 };
 return descMap[type] || '专业智能助手';
};
</script>

<style scoped>
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 60px 80px;
  overflow-y: auto;
}

/* 标题区域 */
.welcome-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 48px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.typing-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9aa0a6;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.welcome-title-wrapper {
  flex: 1;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 14px;
  color: #9aa0a6;
  margin: 8px 0 0 0;
  letter-spacing: 0.3px;
}

/* 智能体选择卡片 */
.suggest-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #3c4043;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.suggest-card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.suggest-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.suggest-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.suggest-card.is-selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #3c4043;
  margin: 0 0 4px 0;
}

.card-desc {
  font-size: 13px;
  color: #9aa0a6;
  margin: 0;
  line-height: 1.5;
}

.card-select-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #dadce0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.suggest-card.is-selected .card-select-indicator {
  background: #3b82f6;
  border-color: #3b82f6;
}

.card-select-indicator i {
  color: #fff;
  font-size: 12px;
}

/* 快捷工具停靠栏 */
.quick-tools {
  margin-bottom: 40px;
}

.tools-title {
  font-size: 14px;
  font-weight: 600;
  color: #3c4043;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.tools-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tools-scroll::-webkit-scrollbar {
  height: 6px;
}

.tools-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 3px;
}

.tools-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.tool-name {
  font-size: 12px;
  color: #5f6368;
  white-space: nowrap;
}

/* 使用提示 */
.usage-tips {
  margin-top: auto;
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #3c4043;
  margin-bottom: 16px;
  letter-spacing: 0.3px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.tip-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #3b82f6;
  flex-shrink: 0;
}

.tip-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #3c4043;
  margin: 0 0 4px 0;
}

.tip-content p {
  font-size: 12px;
  color: #9aa0a6;
  margin: 0;
  line-height: 1.5;
}
</style>