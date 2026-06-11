<script setup>
import { ref, computed, nextTick } from 'vue';
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

// 聊天相关状态
const messages = ref([]);
const inputMessage = ref('');
const isTyping = ref(false);
const currentAgentType = ref('default');
const isNewSession = computed(() => messages.value.length === 0);
const chatHistoryBox = ref(null);
const showScrollBottomBtn = ref(false);
const isInputFocused = ref(false);
const isSidebarCollapsed = ref(true);
const loading = ref(false);
const searchQuery = ref('');

// 智能体类型配置
const agentTypes = [
  { type: 'device', name: '设备问答', icon: 'device', color: '#3b82f6', bgColor: '#e8f0fe' },
  { type: 'fault', name: '故障诊断', icon: 'fault', color: '#f59e0b', bgColor: '#fff3e0' },
  { type: 'business', name: '业务问答', icon: 'business', color: '#10b981', bgColor: '#d1fae5' }
];

// 快捷工具
const quickActions = [
  { id: 'web-read', label: '大模型开发', icon: 'cpu' },
  { id: 'data-analysis', label: '大模型应用', icon: 'monitor' },
  { id: 'digging', label: '知识管理', icon: 'reading' },
  { id: 'file-manage', label: '智能编码', icon: 'magic-stick' },
  { id: 'ppt-maker', label: '智能问数', icon: 'pie-chart' }
];

// 切换智能体
const toggleAgent = (type) => {
  if (currentAgentType.value === type) {
    currentAgentType.value = 'default';
  } else {
    currentAgentType.value = type;
  }
};

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return;
  
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: inputMessage.value,
    timestamp: '刚刚',
    showActions: false,
    isEditing: false
  });
  
  const userMsg = inputMessage.value;
  inputMessage.value = '';
  loading.value = true;
  
  const aiMsgRef = {
    id: Date.now() + 1,
    role: 'ai',
    content: '',
    timestamp: '刚刚',
    isLoading: true,
    thinkingText: '分析问题...',
    elapsedTime: 0,
    suggestions: [],
    score: null,
    comment: '',
    showCommentBox: false
  };
  messages.value.push(aiMsgRef);
  
  nextTick(() => scrollToBottom(true));
  
  setTimeout(() => {
    aiMsgRef.thinkingText = '检索知识库...';
  }, 2000);
  
  setTimeout(() => {
    aiMsgRef.thinkingText = '正在组织回答...';
  }, 4000);
  
  setTimeout(() => {
    loading.value = false;
    aiMsgRef.isLoading = false;
    aiMsgRef.content = `我已收到您的请求："${userMsg}"。\n\n我将为您处理相关工作，包括分析需求、整理资料、生成专业成果。\n\n请问您还需要我做什么？`;
    aiMsgRef.suggestions = [
      { text: '继续深入分析', action: 'deep-analyze' },
      { text: '生成总结报告', action: 'summary-report' },
      { text: '导出结果', action: 'export-result' }
    ];
    nextTick(() => scrollToBottom(true));
  }, 2500);
};

// 键盘事件处理
const handleKeyup = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

// 建议按钮点击
const handleSuggestionClick = (suggestion) => {
  inputMessage.value = suggestion.text;
  sendMessage();
};

// 滚动到底部
const scrollToBottom = (force = false) => {
  nextTick(() => {
    if (chatHistoryBox.value) {
      chatHistoryBox.value.scrollTo({
        top: chatHistoryBox.value.scrollHeight,
        behavior: force ? 'smooth' : 'auto'
      });
    }
  });
};

// 复制文本
const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('内容已复制');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('内容已复制');
    } catch (err) {
      alert('复制失败');
    }
    document.body.removeChild(textarea);
  });
};

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// 滚动处理
const handleScroll = (e) => {
  const el = e.target;
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  showScrollBottomBtn.value = distanceToBottom > 100;
};

// 开始新对话
const startNewChat = () => {
  messages.value = [];
  currentAgentType.value = 'default';
};

// 动态占位符
const dynamicPlaceholder = computed(() => {
  if (currentAgentType.value === 'device') {
    return '在此输入设备相关问题... (当前设备专家, Enter 发送，Shift + Enter 换行)';
  }
  if (currentAgentType.value === 'fault') {
    return '在此输入异常现象或报错代码... (当前排障专家, Enter 发送，Shift + Enter 换行)';
  }
  if (currentAgentType.value === 'business') {
    return '在此输入业务流程相关问题... (当前业务专家, Enter 发送，Shift + Enter 换行)';
  }
  return '帮你整理论文综述、编写 PPT、分析 Excel 等日常工作，输出专业工作成果。';
});
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
      <!-- 工作台页面 - 复刻ChatWindow界面 -->
      <template v-if="currentPage === 'dashboard'">
        <div class="chat-workspace">
          <!-- 顶部标题栏 -->
          <div class="workspace-header">
            <div class="collapse-btn-wrapper" @click="toggleSidebar">
              <i :class="isSidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'" class="collapse-btn"></i>
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
            <div class="chat-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
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
            
            <!-- 主内容区 -->
            <div class="chat-main">
              <!-- 欢迎屏幕 -->
              <div v-if="isNewSession" class="welcome-screen">
                <div class="welcome-content-container">
                  <div class="welcome-header">
                    <h1 class="welcome-title">
                      <span class="typewriter-mask">
                        <span class="gemini-gradient-text">您好，欢迎使用 WTS 协同工作</span>
                      </span>
                      <span class="blinking-cursor">|</span>
                    </h1>
                    <h2 class="welcome-subtitle animate-subtitle">今天需要我为您做点什么？</h2>
                    
                    <div class="agent-selection-hint animate-stagger-0">
                      <div class="hint-icon-wrapper">
                        <i class="el-icon-info"></i>
                      </div>
                      <span class="hint-text">默认使用 <strong class="gemini-gradient-text-small">通用助手</strong>，点选下方卡片可切换特定领域的专家智能体</span>
                    </div>
                  </div>
                  
                  <!-- 智能体选择卡片 -->
                  <div class="suggestion-cards" :class="{ 'has-selection': currentAgentType !== 'default' }">
                    <div 
                      class="suggest-card device-card animate-stagger-1"
                      :class="{ 'is-selected': currentAgentType === 'device' }"
                      @click="toggleAgent('device')"
                    >
                      <div class="card-content-wrapper">
                        <div class="card-icon-box device-bg">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                            <rect x="9" y="9" width="6" height="6"/>
                            <line x1="9" y1="1" x2="9" y2="4"/>
                            <line x1="15" y1="1" x2="15" y2="4"/>
                            <line x1="9" y1="20" x2="9" y2="23"/>
                            <line x1="15" y1="20" x2="15" y2="23"/>
                            <line x1="20" y1="9" x2="23" y2="9"/>
                            <line x1="20" y1="15" x2="23" y2="15"/>
                            <line x1="1" y1="9" x2="4" y2="9"/>
                            <line x1="1" y1="15" x2="4" y2="15"/>
                          </svg>
                        </div>
                        <div class="card-text-box">
                          <span>设备问答</span>
                          <p>查询设备操作规范、参数配置及维保标准</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      class="suggest-card fault-card animate-stagger-2"
                      :class="{ 'is-selected': currentAgentType === 'fault' }"
                      @click="toggleAgent('fault')"
                    >
                      <div class="card-content-wrapper">
                        <div class="card-icon-box fault-bg">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
                          </svg>
                        </div>
                        <div class="card-text-box">
                          <span>故障诊断</span>
                          <p>深度分析异常现象与试验台架排障方案</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      class="suggest-card business-card animate-stagger-3"
                      :class="{ 'is-selected': currentAgentType === 'business' }"
                      @click="toggleAgent('business')"
                    >
                      <div class="card-content-wrapper">
                        <div class="card-icon-box business-bg">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <div class="card-text-box">
                          <span>业务问答</span>
                          <p>了解工艺流程、工装规范及仓库管理流转</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 快捷工具停靠栏 -->
                  <div class="ai-tool-dock animate-stagger-4">
                    <div class="dock-inner">
                      <a href="https://deep-engine.weichai.com/" target="_blank" class="dock-item" title="大模型开发平台">
                        <i class="el-icon-cpu"></i><span>大模型开发</span>
                      </a>
                      <div class="dock-divider"></div>
                      <a href="https://app-engine.weichai.com/" target="_blank" class="dock-item" title="大模型应用平台">
                        <i class="el-icon-monitor"></i><span>大模型应用</span>
                      </a>
                      <div class="dock-divider"></div>
                      <a href="https://k-engine.weichai.com/newclient/agent/" target="_blank" class="dock-item" title="知识管理平台">
                        <i class="el-icon-reading"></i><span>知识管理</span>
                      </a>
                      <div class="dock-divider"></div>
                      <a href="https://code-engine.weichai.com/" target="_blank" class="dock-item" title="智能编码平台">
                        <i class="el-icon-magic-stick"></i><span>智能编码</span>
                      </a>
                      <div class="dock-divider"></div>
                      <a href="https://data-engine.weichai.com/" target="_blank" class="dock-item" title="智能问数平台">
                        <i class="el-icon-pie-chart"></i><span>智能问数</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 聊天历史区域 -->
              <div v-show="!isNewSession" ref="chatHistoryBox" class="chat-history-box" @scroll="handleScroll">
                <transition-group name="msg-slide" tag="div" class="msg-transition-wrapper">
                  <div 
                    v-for="(msg, index) in messages" 
                    :key="msg.id"
                    class="message-item"
                    :class="msg.role"
                  >
                    <!-- AI消息 -->
                    <template v-if="msg.role === 'ai'">
                      <div class="avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3h-6z"/>
                          <circle cx="12" cy="10" r="2"/>
                          <path d="M8 21h8"/>
                        </svg>
                      </div>
                      <div class="message-content ai-content">
                        <div v-if="msg.isLoading" class="premium-thinking-container">
                          <div class="thinking-badge">
                            <i class="el-icon-loading thinking-icon"></i>
                            <span class="thinking-text-glow">{{ msg.thinkingText }}</span>
                            <span class="thinking-timer">已用时 {{ msg.elapsedTime || 0 }}s</span>
                            <div class="thinking-dots">
                              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                            </div>
                          </div>
                        </div>
                        <div v-else>
                          <div class="markdown-body">{{ msg.content }}</div>
                          
                          <!-- 建议按钮 -->
                          <div v-if="msg.suggestions && msg.suggestions.length" class="suggestions-bar">
                            <button
                              v-for="suggestion in msg.suggestions"
                              :key="suggestion.action"
                              class="suggestion-btn"
                              @click="handleSuggestionClick(suggestion)"
                            >
                              {{ suggestion.text }}
                            </button>
                          </div>
                          
                          <!-- AI反馈区域 -->
                          <div class="ai-feedback-section">
                            <div class="message-actions">
                              <div class="action-btn" title="复制" @click="copyText(msg.content)">
                                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              </div>
                              <div class="action-divider"></div>
                              <div class="action-btn" :class="{ 'is-active': msg.score === 1 }" title="赞同" @click="msg.score = msg.score === 1 ? null : 1">
                                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                </svg>
                              </div>
                              <div class="action-btn" :class="{ 'is-active': msg.score === 0 }" title="不赞同" @click="msg.score = msg.score === 0 ? null : 0">
                                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    
                    <!-- 用户消息 -->
                    <template v-else-if="msg.role === 'user'">
                      <div class="message-content user-content" @mouseenter="msg.showActions = true" @mouseleave="msg.showActions = false">
                        {{ msg.content }}
                        <transition name="el-fade-in">
                          <div class="user-actions" v-show="msg.showActions">
                            <el-tooltip content="重新发送" placement="top" :enterable="false">
                              <i class="el-icon-refresh-right"></i>
                            </el-tooltip>
                            <el-tooltip content="编辑" placement="top" :enterable="false">
                              <i class="el-icon-edit"></i>
                            </el-tooltip>
                            <el-tooltip content="复制" placement="top" :enterable="false">
                              <i class="el-icon-copy-document" @click="copyText(msg.content)"></i>
                            </el-tooltip>
                          </div>
                        </transition>
                      </div>
                      <div class="avatar user-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    </template>
                  </div>
                </transition-group>
              </div>
              
              <!-- 滚动到底部按钮 -->
              <transition name="el-zoom-in-bottom">
                <div v-show="showScrollBottomBtn" class="floating-scroll-btn" @click="scrollToBottom(true)" title="回到最新">
                  <i class="el-icon-bottom"></i>
                </div>
              </transition>
              
              <!-- 底部输入区域 -->
              <div class="chat-footer animate-footer-up">
                <!-- 智能体切换 -->
                <transition name="el-zoom-in-bottom">
                  <div v-show="!isNewSession" class="agent-switch-container">
                    <el-radio-group v-model="currentAgentType" size="small">
                      <el-radio-button label="device" @click.native.prevent="toggleAgent('device')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="switch-svg-icon">
                          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                          <rect x="9" y="9" width="6" height="6"/>
                        </svg> 设备问答
                      </el-radio-button>
                      <el-radio-button label="fault" @click.native.prevent="toggleAgent('fault')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="switch-svg-icon">
                          <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z"/>
                        </svg> 故障诊断
                      </el-radio-button>
                      <el-radio-button label="business" @click.native.prevent="toggleAgent('business')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="switch-svg-icon">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                        </svg> 业务问答
                      </el-radio-button>
                    </el-radio-group>
                  </div>
                </transition>
                
                <!-- 输入区域 -->
                <div class="chat-input-area">
                  <div class="gemini-input-container" :class="{ 'is-focused': isInputFocused }">
                    <el-input 
                      type="textarea" 
                      :autosize="{ minRows: 1, maxRows: 6 }" 
                      :placeholder="dynamicPlaceholder"
                      v-model="inputMessage" 
                      @keyup.enter.native="handleKeyup" 
                      @focus="isInputFocused = true"
                      @blur="isInputFocused = false" 
                      :disabled="loading"
                      class="chat-input"
                    ></el-input>
                    
                    <div v-if="loading" class="stop-icon-wrapper" title="停止生成">
                      <div class="stop-square"></div>
                    </div>
                    
                    <div v-else class="send-icon-wrapper" :class="{ 'is-active': inputMessage.trim() }" @click="sendMessage()">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="footer-disclaimer">AI 诊断结果由大模型生成，仅供参考，请结合实际排查验证。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 试验大纲生成页面 -->
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

/* 全局滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 10px;
  transition: background-color 0.3s;
}

*:hover::-webkit-scrollbar-thumb {
  background-color: rgba(95, 99, 104, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(95, 99, 104, 0.4) !important;
}

::-webkit-scrollbar-button {
  display: none !important;
}

/* 工作台样式 */
.chat-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
}

/* 顶部标题栏 */
.workspace-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.collapse-btn-wrapper {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #5f6368;
}

.collapse-btn-wrapper:hover {
  background: #f1f3f4;
  color: #1a73e8;
}

.collapse-btn {
  font-size: 22px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gradient-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(120deg, #1a73e8, #4285f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.version-tag {
  border-radius: 6px;
  font-weight: 700;
  border: none;
  background: #e8f0fe;
  color: #1a73e8;
}

.title-sub {
  font-size: 12px;
  color: #9aa0a6;
  font-weight: 500;
}

.header-quick-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-divider {
  height: 24px;
  margin: 0 !important;
}

.app-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: #5f6368;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-close-btn:hover {
  background: #f1f3f4;
  color: #1a73e8;
}

.app-matrix-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: #5f6368;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-matrix-btn:hover {
  background: #f1f3f4;
  color: #1a73e8;
}

.app-matrix-btn i {
  font-size: 18px;
}

.ai-matrix-dropdown {
  padding: 12px;
}

.matrix-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.matrix-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.matrix-item:hover {
  background: #f1f3f4;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box i {
  font-size: 18px;
}

.icon-dev {
  background: #e8f0fe;
  color: #3b82f6;
}

.icon-app {
  background: #fff3e0;
  color: #f59e0b;
}

.icon-km {
  background: #d1fae5;
  color: #10b981;
}

.icon-code {
  background: #ede9fe;
  color: #8b5cf6;
}

.icon-data {
  background: #fce7f3;
  color: #ec4899;
}

.matrix-item span {
  font-size: 11px;
  color: #3c4043;
}

/* 主聊天容器 */
.chat-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 左侧边栏 */
.chat-sidebar {
  width: 280px;
  background-color: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: width 0.35s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s;
  overflow: hidden;
  z-index: 2;
}

.chat-sidebar.is-collapsed {
  width: 0;
  opacity: 0;
  border: none;
}

.sidebar-inner {
  width: 280px;
  padding: 24px 12px 20px;
  display: flex;
  flex-direction: column;
}

.new-chat-btn {
  margin-bottom: 16px;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 600;
}

.sidebar-search-wrapper {
  margin-bottom: 16px;
}

.premium-search-input {
  border-radius: 8px;
  background: #f1f3f4;
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
  padding: 60px 20px;
  color: #9aa0a6;
}

.empty-state-sidebar i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-sidebar p {
  font-size: 13px;
}

/* 主内容区 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 欢迎屏幕 */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 40px;
}

.welcome-content-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-header {
  text-align: center;
  margin-bottom: 88px;
}

.welcome-title {
  font-size: 35px;
  font-weight: 700;
  margin: 0 0 20px 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gemini-gradient-text {
  background: linear-gradient(90deg, #4285f4, #d96570, #9b51e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gemini-gradient-text-small {
  background: linear-gradient(90deg, #4285f4, #d96570, #9b51e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: inherit;
}

.welcome-subtitle {
  font-size: 25px;
  color: #c4c7c5;
  font-weight: 500;
  margin: 0;
}

.typewriter-mask {
  display: inline-block;
  overflow: hidden;
  max-width: 0;
  white-space: nowrap;
  animation: typeWriter 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards;
}

.blinking-cursor {
  color: #1a73e8;
  font-weight: 300;
  margin-left: 2px;
  opacity: 0;
  display: inline-block;
  vertical-align: bottom;
  animation:
    showCursor 0.1s 0.2s forwards,
    blinkCursor 0.8s step-end infinite 0.2s,
    hideCursor 0.4s 2.0s forwards;
}

@keyframes typeWriter {
  0% { max-width: 0; }
  100% { max-width: 800px; }
}

@keyframes showCursor { to { opacity: 1; } }
@keyframes hideCursor { to { opacity: 0; } }
@keyframes blinkCursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.agent-selection-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.hint-icon-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-icon-wrapper i {
  font-size: 13px;
  color: #1a73e8;
}

.hint-text {
  font-size: 13px;
  color: #5f6368;
}

/* 建议卡片 */
.suggestion-cards {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.suggest-card {
  flex: 1;
  border: 1px solid #e8eaed;
  border-radius: 20px;
  padding: 2px;
  gap: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-height: 150px;
  position: relative;
  will-change: transform, box-shadow;
}

.suggest-card.device-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 100%);
}

.suggest-card.fault-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 100%);
}

.suggest-card.business-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 100%);
}

.suggestion-cards.has-selection .suggest-card:not(.is-selected) {
  opacity: 0.5;
  filter: grayscale(10%);
  box-shadow: none;
  transform: translateY(0);
}

.suggest-card.is-selected {
  transform: translateY(-2px) scale(1.02);
  border-color: transparent;
}

.suggest-card.device-card.is-selected {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 12px 32px rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.15) 100%);
}

.suggest-card.fault-card.is-selected {
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15), 0 12px 32px rgba(245, 158, 11, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.15) 100%);
}

.suggest-card.business-card.is-selected {
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15), 0 12px 32px rgba(16, 185, 129, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.15) 100%);
}

.card-content-wrapper {
  position: relative;
  z-index: 2;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon-box svg {
  width: 22px;
  height: 22px;
}

.device-bg {
  background: #e8f0fe;
  color: #3b82f6;
}

.fault-bg {
  background: #fff3e0;
  color: #f59e0b;
}

.business-bg {
  background: #d1fae5;
  color: #10b981;
}

.card-text-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-text-box span {
  font-size: 18px;
  font-weight: 700;
  color: #202124;
}

.card-text-box p {
  font-size: 14px;
  color: #5f6368;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

/* 动画类 */
.animate-subtitle {
  opacity: 0;
  animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s forwards;
}

.animate-stagger-0 {
  animation: slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s both;
}

.animate-stagger-1 {
  animation: slideUpCard 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.9s both;
}

.animate-stagger-2 {
  animation: slideUpCard 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1.0s both;
}

.animate-stagger-3 {
  animation: slideUpCard 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1.1s both;
}

.animate-stagger-4 {
  animation: slideUpFade 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s both;
}

.animate-footer-up {
  animation: footerEntrance 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1.2s both;
}

@keyframes slideUpFade {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideUpCard {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 0.85; transform: translateY(0); }
}

@keyframes footerEntrance {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 工具停靠栏 */
.ai-tool-dock {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.dock-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #5f6368;
  text-decoration: none;
}

.dock-item:hover {
  background: #f1f3f4;
  color: #1a73e8;
}

.dock-item i {
  font-size: 18px;
}

.dock-item span {
  font-size: 10px;
  font-weight: 500;
}

.dock-divider {
  width: 1px;
  height: 24px;
  background: #e8eaed;
  margin: 0 4px;
}

/* 聊天历史区域 */
.chat-history-box {
  flex: 1;
  overflow-y: auto;
  padding: 30px 40px;
  background: #ffffff;
  scroll-behavior: smooth;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
}

.msg-transition-wrapper {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  margin-bottom: 40px;
  align-items: flex-start;
}

.message-item.ai {
  justify-content: flex-start;
}

.message-item.user {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-item.user .avatar {
  margin-right: 0;
  margin-left: 10px;
}

.avatar svg {
  width: 18px;
  height: 18px;
  color: #5f6368;
}

.user-avatar svg {
  color: #1a73e8;
}

.message-content {
  max-width: 78%;
  line-height: 1.7;
  color: #202124;
  overflow-wrap: break-word;
  position: relative;
}

.ai-content {
  padding: 4px 10px;
}

.user-content {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 16px 16px 4px 16px;
}

.user-content .markdown-body {
  color: white;
}

.user-actions {
  position: absolute;
  bottom: -30px;
  right: 4px;
  display: flex;
  gap: 12px;
  color: #80868b;
  font-size: 15px;
}

.user-actions i {
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 6px;
}

.user-actions i:hover {
  color: #1a73e8;
  background: #f0f4f9;
}

/* 思考中状态 */
.premium-thinking-container {
  padding: 12px 0;
}

.thinking-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(241, 243, 244, 0.8);
  border-radius: 12px;
}

.thinking-icon {
  font-size: 16px;
  color: #1a73e8;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.thinking-text-glow {
  font-size: 13px;
  color: #5f6368;
}

.thinking-timer {
  font-size: 12px;
  color: #9aa0a6;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1a73e8;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.thinking-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #202124;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-content .markdown-body {
  color: white;
}

/* 建议按钮栏 */
.suggestions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.suggestion-btn {
  padding: 6px 14px;
  border: 1px solid #dadce0;
  border-radius: 18px;
  background: white;
  font-size: 13px;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-btn:hover {
  background: #f1f3f4;
  border-color: #1a73e8;
  color: #1a73e8;
}

/* AI反馈区域 */
.ai-feedback-section {
  margin-top: 16px;
  display: inline-flex;
  flex-direction: column;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: #202124;
}

.action-btn.is-active {
  color: #1a73e8;
  background-color: #e8f0fe;
}

.action-divider {
  width: 1px;
  height: 16px;
  background-color: #dadce0;
  margin: 0 6px;
}

/* 浮动滚动按钮 */
.floating-scroll-btn {
  position: fixed;
  right: 48px;
  bottom: 120px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
}

.floating-scroll-btn:hover {
  background: #f1f3f4;
}

.floating-scroll-btn i {
  font-size: 16px;
  color: #5f6368;
}

/* 底部输入区域 */
.chat-footer {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%);
  padding: 10px 110px 24px;
  position: relative;
  z-index: 10;
  transition: padding 0.35s cubic-bezier(0.2, 0, 0, 1);
}

.chat-footer.is-expanded {
  padding: 10px 10px 24px;
}

.agent-switch-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
  padding-left: 10px;
}

.switch-svg-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.chat-input-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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
}

.chat-input::placeholder {
  color: #9aa0a6;
}

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

.footer-disclaimer {
  text-align: center;
  font-size: 12px;
  color: #9aa0a6;
  letter-spacing: 0.3px;
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
  transform: scale(0.9);
}

/* 任务管理页面 */
.tasks-page {
  padding: 24px;
  height: 100%;
  background: #f8fafc;
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
  color: #202124;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  background: #1557b0;
}

.add-task-btn svg {
  width: 16px;
  height: 16px;
}

.tasks-container {
  display: flex;
  gap: 24px;
  height: calc(100% - 60px);
}

.task-column {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.column-title {
  font-size: 14px;
  font-weight: 600;
  color: #202124;
}

.column-count {
  padding: 2px 8px;
  background: #f1f3f4;
  border-radius: 10px;
  font-size: 12px;
  color: #5f6368;
}

.task-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.task-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-card:hover {
  background: #f1f3f4;
}

.task-card.completed {
  opacity: 0.6;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 8px;
}

.task-tag {
  padding: 2px 8px;
  background: #e8f0fe;
  border-radius: 4px;
  font-size: 11px;
  color: #1a73e8;
}

.task-date {
  font-size: 11px;
  color: #9aa0a6;
}
</style>