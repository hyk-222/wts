<template>
  <aside class="trae-sidebar">
    <div class="sidebar-header">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="brand-text">WTS Studio</span>
    </div>

    <div class="sidebar-scrollable">
      <div class="nav-group">
        <div class="nav-item" :class="{ active: route.path === '/' }" @click="goTo('/')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>工作台</span>
        </div>
        <div class="nav-item" :class="{ active: route.path === '/tasks' }" @click="goTo('/tasks')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>任务管理</span>
        </div>
      </div>

      <div class="nav-group">
        <div class="group-title">技能</div>
        <div class="nav-item" :class="{ active: route.path === '/outline' }" @click="goTo('/outline')">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          <span>试验大纲生成</span>
        </div>
      </div>

      <!-- 任务列表区域 -->
      <div class="nav-group">
        <div class="group-header">
          <span class="group-title">任务列表</span>
          <el-button type="primary" size="mini" class="new-chat-btn" @click="handleNewChat">
            <i class="el-icon-plus"></i> 新对话
          </el-button>
        </div>
        
        <!-- 搜索框 -->
        <div class="sidebar-search-wrapper">
          <el-input 
            v-model="chatStore.searchQuery" 
            placeholder="搜索历史记录..." 
            prefix-icon="el-icon-search" 
            size="small" 
            clearable
            class="sidebar-search-input"
          ></el-input>
        </div>
        
        <!-- 历史任务列表 -->
        <div class="history-container">
          <TransitionGroup name="list-fade" tag="div">
            <div 
              v-for="item in chatStore.filteredHistoryList" 
              :key="item.sessionId" 
              class="history-item"
              :class="{ active: chatStore.currentSessionId === item.sessionId }"
              @click="handleSelectHistory(item)"
            >
              <div class="item-main">
                <i class="el-icon-star-on pin-icon" v-if="item.isPinned === 1"></i>
                <i class="el-icon-chat-dot-square normal-icon" v-else></i>
                
                <span v-if="!item.isRenaming" class="history-item-title" :title="item.sessionName || item.queryText">
                  {{ item.sessionName || item.queryText }}
                </span>
                <el-input 
                  v-else 
                  size="mini" 
                  v-model="item.tempName" 
                  ref="renameInput" 
                  @blur="chatStore.confirmRename(item)"
                  @keyup.enter.native="chatStore.confirmRename(item)" 
                  @click.native.stop 
                  class="rename-input"
                ></el-input>
              </div>
              
              <el-dropdown trigger="click" @command="handleCommand($event, item)" @click.native.stop>
                <span class="el-dropdown-link action-more-btn">
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="sidebar-dropdown">
                  <el-dropdown-item command="pin">
                    <i :class="item.isPinned === 1 ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                    {{ item.isPinned === 1 ? '取消固定' : '固定会话' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="rename"><i class="el-icon-edit"></i> 重命名</el-dropdown-item>
                  <el-dropdown-item command="delete" divided class="danger-item"><i class="el-icon-delete"></i> 删除记录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </TransitionGroup>
          
          <div v-if="chatStore.filteredHistoryList.length === 0" class="empty-history">
            <i class="el-icon-search" v-if="chatStore.searchQuery"></i>
            <i class="el-icon-box" v-else></i>
            <span>{{ chatStore.searchQuery ? '未找到相关记录' : '暂无历史处理任务' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <el-dropdown trigger="click" placement="top-start" class="user-dropdown-container">
        <div class="user-profile-card">
          <div class="avatar">{{ userInitial }}</div>
          <div class="user-info">
            <span class="name">{{ userStore.state?.nickName || userStore.state?.name || '用户' }}</span>
            <span class="role">{{ userStore.state?.roles?.[0] === 'ROLE_DEFAULT' ? '普通用户' : '系统专家' }}</span>
          </div>
          <i class="el-icon-moremore more-icon"></i>
        </div>
        
        <el-dropdown-menu slot="dropdown" class="trae-dropdown">
          <el-dropdown-item class="dropdown-item"><i class="el-icon-user"></i> 个人设置</el-dropdown-item>
          <el-dropdown-item class="dropdown-item" @click.native="handleSwitchAccount"><i class="el-icon-refresh"></i> 切换账号</el-dropdown-item>
          <el-dropdown-item class="dropdown-item danger" divided @click.native="handleLogout"><i class="el-icon-switch-button"></i> 退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useChatStore } from '@/stores/chat';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const chatStore = useChatStore();

const renameInput = ref(null);

const userInitial = computed(() => {
  const name = userStore.state?.nickName || userStore.state?.name || 'U';
  return name.charAt(0).toUpperCase();
});

const goTo = (path) => {
  router.push(path);
};

const handleSelectHistory = (item) => {
  chatStore.loadHistoryDetail(item);
  if (route.path !== '/') {
    router.push('/');
  }
};

const handleNewChat = () => {
  chatStore.startNewChat();
  router.push('/');
};

const handleCommand = (command, item) => {
  if (command === 'pin') {
    handleTogglePin(item);
  } else if (command === 'rename') {
    handleRename(item);
  } else if (command === 'delete') {
    handleDeleteSession(item);
  }
};

const handleTogglePin = (item) => {
  chatStore.togglePin(item);
};

const handleRename = (item) => {
  item.isRenaming = true;
  item.tempName = item.sessionName || item.queryText;
};

const handleDeleteSession = (item) => {
  chatStore.handleDeleteSession(item);
};

const handleSwitchAccount = () => {
  userStore.logout();
  router.push('/login');
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

onMounted(() => {
  chatStore.fetchHistory();
});
</script>

<style scoped>
.trae-sidebar {
  width: 260px;
  background: #FAFAFA;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
}
.sidebar-header {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  flex-shrink: 0;
}
.brand-logo { width: 22px; height: 22px; color: #4F46E5; }
.brand-text { font-size: 14px; font-weight: 700; color: #111827; }

.sidebar-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sidebar-scrollable::-webkit-scrollbar { display: none; }

.group-title {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 10px;
  margin-bottom: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #4B5563;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
}
.nav-icon { width: 16px; height: 16px; }
.nav-item:hover { background: #F3F4F6; color: #111827; }
.nav-item.active { background: #EEF2FF; color: #4F46E5; }

/* 组头部 */
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-bottom: 6px;
}
.new-chat-btn {
  padding: 4px 10px !important;
  font-size: 11.5px !important;
  border-radius: 4px !important;
}

/* 搜索框 */
.sidebar-search-wrapper {
  padding: 0 4px;
  margin-bottom: 8px;
}
.sidebar-search-input {
  font-size: 12px;
  border-radius: 6px;
}

/* 真实历史任务项样式列表 */
.history-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #4B5563;
  transition: all 0.15s;
}
.history-item:hover { 
  background: #F3F4F6; 
  color: #111827; 
}
.history-item:hover .action-more-btn {
  opacity: 1;
}
.history-item.active { 
  background: #E5E7EB; 
  color: #111827; 
  font-weight: 500; 
}
.item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.pin-icon {
  font-size: 12px;
  color: #F59E0B;
}
.normal-icon {
  font-size: 14px;
  color: #9CA3AF;
}
.history-item-title {
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.action-more-btn {
  opacity: 0;
  color: #9CA3AF;
  transition: opacity 0.2s;
  padding: 2px;
}
.action-more-btn:hover {
  color: #6B7280;
}
.empty-history {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  color: #9CA3AF;
  font-size: 11.5px;
  flex-direction: column;
}
.empty-history i {
  font-size: 24px;
  margin-bottom: 8px;
}

/* 侧边栏下拉菜单 */
.sidebar-dropdown {
  width: 160px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.sidebar-dropdown .danger-item {
  color: #DC2626;
}

/* 列表过渡动画 */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.2s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-footer { padding: 10px; border-top: 1px solid #E5E7EB; background: #FAFAFA; }
.user-dropdown-container { width: 100%; }
.user-profile-card { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 6px; cursor: pointer; }
.user-profile-card:hover { background: #F3F4F6; }
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}
.user-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.user-info .name { font-size: 12.5px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-info .role { font-size: 10.5px; color: #6B7280; }
.more-icon { font-size: 12px; color: #9CA3AF; }

.trae-dropdown { width: 200px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
.dropdown-item { font-size: 12.5px; padding: 8px 12px; }
.dropdown-item.danger { color: #DC2626; }
</style>