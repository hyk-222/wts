<script setup>
import { ref, computed, onMounted } from 'vue';
import Login from './views/Login.vue';
import Layout from './components/Layout.vue';
import FormGenerator from './views/FormGenerator.vue';
import OutlineGenerator from './views/OutlineGenerator.vue';
import { useUserStore } from './stores/user';

const userStore = useUserStore();

const isLoggedIn = ref(false);
const currentUser = ref(null);
const currentPage = ref('dashboard');

const handleLoginSuccess = (user) => {
  currentUser.value = user;
  isLoggedIn.value = true;
  currentPage.value = 'dashboard';
};

const handleLogout = () => {
  userStore.logout();
  isLoggedIn.value = false;
  currentUser.value = null;
  currentPage.value = 'dashboard';
};

const handleNavigate = (pageId) => {
  currentPage.value = pageId;
};

const renderPage = computed(() => {
  switch (currentPage.value) {
    case 'form':
      return FormGenerator;
    case 'outline':
      return OutlineGenerator;
    case 'tasks':
      return null;
    case 'reports':
      return null;
    case 'settings':
      return null;
    default:
      return null;
  }
});

onMounted(() => {
  if (userStore.hasToken()) {
    userStore.getUserInfo().then(() => {
      isLoggedIn.value = true;
      currentUser.value = userStore.state;
    }).catch(() => {
      isLoggedIn.value = false;
    });
  }
});

// 聊天消息数据
const messages = ref([
  {
    id: 1,
    type: 'system',
    content: 'WTS 协同工作',
    timestamp: '刚刚',
    badge: 'Beta'
  },
  {
    id: 2,
    type: 'assistant',
    content: '帮你整理论文综述、编写 PPT、分析 Excel 等日常工作，输出专业工作成果。',
    timestamp: '刚刚'
  }
]);

const inputMessage = ref('');
const isTyping = ref(false);

const quickActions = [
  { id: 'web-read', label: '网页读取', icon: 'globe' },
  { id: 'data-analysis', label: '调研分析', icon: 'bar-chart' },
  { id: 'digging', label: '数据挖掘', icon: 'database' },
  { id: 'file-manage', label: '文件管理', icon: 'folder' }
];

const sendMessage = () => {
  if (!inputMessage.value.trim()) return;
  
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    timestamp: '刚刚'
  });
  
  const userMsg = inputMessage.value;
  inputMessage.value = '';
  
  isTyping.value = true;
  
  setTimeout(() => {
    isTyping.value = false;
    messages.value.push({
      id: Date.now() + 1,
      type: 'assistant',
      content: `我已收到您的请求："${userMsg}"。我将为您处理相关工作。`,
      timestamp: '刚刚'
    });
  }, 1500);
};

const handleKeyup = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div id="app">
    <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    
    <Layout 
      v-else 
      :current-user="currentUser"
      @logout="handleLogout" 
      @navigate="handleNavigate"
    >
      <!-- 工作台页面 - 聊天框形式 -->
      <template v-if="currentPage === 'dashboard'">
        <div class="chat-workspace">
          <!-- 消息列表 -->
          <div class="messages-container">
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message-wrapper"
              :class="message.type"
            >
              <!-- 系统消息 -->
              <div v-if="message.type === 'system'" class="system-message">
                <div class="system-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span>{{ message.content }}</span>
                  <span v-if="message.badge" class="beta-badge">{{ message.badge }}</span>
                </div>
              </div>
              
              <!-- 助手消息 -->
              <div v-else-if="message.type === 'assistant'" class="assistant-message">
                <div class="message-avatar assistant-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3h-6z"/>
                    <circle cx="12" cy="10" r="2"/>
                    <path d="M8 21h8"/>
                  </svg>
                </div>
                <div class="message-content">
                  <p>{{ message.content }}</p>
                  <span class="message-time">{{ message.timestamp }}</span>
                </div>
              </div>
              
              <!-- 用户消息 -->
              <div v-else-if="message.type === 'user'" class="user-message">
                <div class="message-content">
                  <p>{{ message.content }}</p>
                  <span class="message-time">{{ message.timestamp }}</span>
                </div>
                <div class="message-avatar user-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- 正在输入提示 -->
            <div v-if="isTyping" class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>WTS 正在思考...</span>
            </div>
          </div>
          
          <!-- 快捷操作按钮 -->
          <div class="quick-actions-bar">
            <button 
              v-for="action in quickActions" 
              :key="action.id"
              class="quick-action-btn"
            >
              <svg v-if="action.icon === 'globe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <svg v-else-if="action.icon === 'bar-chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <svg v-else-if="action.icon === 'database'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
              <svg v-else-if="action.icon === 'folder'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ action.label }}</span>
            </button>
          </div>
          
          <!-- 输入框 -->
          <div class="input-area">
            <div class="input-wrapper">
              <textarea
                v-model="inputMessage"
                placeholder="帮你整理论文综述、编写 PPT、分析 Excel 等日常工作，输出专业工作成果。"
                @keyup="handleKeyup"
                class="message-input"
                rows="1"
              ></textarea>
              <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else-if="currentPage === 'outline'">
        <OutlineGenerator />
      </template>

      <!-- 任务管理页面 -->
      <template v-else-if="currentPage === 'tasks'">
        <div class="tasks-page">
          <div class="page-header">
            <h2>任务管理</h2>
            <button class="add-task-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>新建任务</span>
            </button>
          </div>
          
          <div class="tasks-container">
            <div class="task-column">
              <div class="column-header">
                <span class="column-title">待处理</span>
                <span class="column-count">3</span>
              </div>
              <div class="task-cards">
                <div class="task-card">
                  <div class="task-title">完成试验报告初稿</div>
                  <div class="task-meta">
                    <span class="task-tag">试验</span>
                    <span class="task-date">今天</span>
                  </div>
                </div>
                <div class="task-card">
                  <div class="task-title">整理试验数据</div>
                  <div class="task-meta">
                    <span class="task-tag">数据</span>
                    <span class="task-date">明天</span>
                  </div>
                </div>
                <div class="task-card">
                  <div class="task-title">编写项目文档</div>
                  <div class="task-meta">
                    <span class="task-tag">文档</span>
                    <span class="task-date">本周</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="task-column">
              <div class="column-header">
                <span class="column-title">进行中</span>
                <span class="column-count">2</span>
              </div>
              <div class="task-cards">
                <div class="task-card">
                  <div class="task-title">分析试验结果</div>
                  <div class="task-meta">
                    <span class="task-tag">分析</span>
                    <span class="task-date">今天</span>
                  </div>
                </div>
                <div class="task-card">
                  <div class="task-title">准备汇报材料</div>
                  <div class="task-meta">
                    <span class="task-tag">汇报</span>
                    <span class="task-date">本周</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="task-column">
              <div class="column-header">
                <span class="column-title">已完成</span>
                <span class="column-count">5</span>
              </div>
              <div class="task-cards">
                <div class="task-card completed">
                  <div class="task-title">完成需求调研</div>
                  <div class="task-meta">
                    <span class="task-tag">调研</span>
                    <span class="task-date">上周</span>
                  </div>
                </div>
                <div class="task-card completed">
                  <div class="task-title">系统架构设计</div>
                  <div class="task-meta">
                    <span class="task-tag">设计</span>
                    <span class="task-date">上周</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Layout>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
}

/* 工作台样式 */
.chat-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-wrapper.system {
  justify-content: center;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.system-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.system-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.system-header svg {
  width: 18px;
  height: 18px;
  color: #6366f1;
}

.beta-badge {
  background: #eef2ff;
  color: #6366f1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.assistant-message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assistant-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.assistant-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.user-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.message-content {
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-content p {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  margin-bottom: 6px;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
}

.user-message {
  display: flex;
  gap: 12px;
  flex-direction: row-reverse;
  max-width: 80%;
}

.user-message .message-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.user-message .message-content p {
  color: white;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  color: #64748b;
  font-size: 13px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.quick-actions-bar {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 150ms ease;
}

.quick-action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.quick-action-btn svg {
  width: 14px;
  height: 14px;
}

.input-area {
  padding: 20px 0 0;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
  max-height: 150px;
  font-family: inherit;
}

.message-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 18px;
  height: 18px;
  color: white;
}

/* 任务管理页面样式 */
.tasks-page {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.add-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.add-task-btn svg {
  width: 16px;
  height: 16px;
}

.tasks-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.task-column {
  min-width: 280px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.column-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.column-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 150ms ease;
}

.task-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-card.completed {
  opacity: 0.6;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-tag {
  background: #eef2ff;
  color: #6366f1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.task-date {
  font-size: 11px;
  color: #94a3b8;
}
</style>
