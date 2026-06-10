<script setup>
import { ref } from 'vue';

const formTemplates = ref([
  { id: 1, name: '发动机性能测试表', category: '发动机测试', createTime: '2024-01-15', status: 'active' },
  { id: 2, name: '零部件耐久性试验表', category: '零部件测试', createTime: '2024-01-14', status: 'active' },
  { id: 3, name: '排放检测记录表', category: '排放测试', createTime: '2024-01-13', status: 'draft' },
  { id: 4, name: '振动测试报告表', category: '可靠性测试', createTime: '2024-01-12', status: 'active' },
]);

const activeTab = ref('templates');
const searchQuery = ref('');

const tabs = [
  { id: 'templates', label: '表单模板', count: 4 },
  { id: 'instances', label: '已生成表单', count: 28 },
  { id: 'history', label: '历史记录', count: 156 },
];

const selectedTemplate = ref(null);

const selectTemplate = (template) => {
  selectedTemplate.value = template;
};

const generateForm = () => {
  if (selectedTemplate.value) {
    alert(`正在生成表单: ${selectedTemplate.value.name}\n\n功能开发中...`);
  }
};
</script>

<template>
  <div class="form-generator">
    <div class="page-header">
      <div class="header-title">
        <h2>试验表单生成</h2>
        <p>创建和管理试验数据采集表单</p>
      </div>
      <button class="primary-btn" @click="generateForm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建表单
      </button>
    </div>

    <div class="tab-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab', { 'active': activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.label }}</span>
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索表单模板..."
        />
      </div>
    </div>

    <div class="template-grid">
      <div 
        v-for="template in formTemplates" 
        :key="template.id"
        :class="['template-card', { 'selected': selectedTemplate?.id === template.id }]"
        @click="selectTemplate(template)"
      >
        <div class="template-header">
          <div class="template-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <span :class="['status-badge', template.status]">
            {{ template.status === 'active' ? '已启用' : '草稿' }}
          </span>
        </div>
        
        <h3 class="template-name">{{ template.name }}</h3>
        <p class="template-category">{{ template.category }}</p>
        
        <div class="template-footer">
          <span class="create-time">{{ template.createTime }}</span>
          <button class="action-icon" title="编辑">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="formTemplates.length === 0">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h3>暂无表单模板</h3>
      <p>点击上方按钮创建第一个表单模板</p>
    </div>
  </div>
</template>

<style scoped>
.form-generator {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-title h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.header-title p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #64748b;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.primary-btn svg {
  width: 18px;
  height: 18px;
}

.tab-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 150ms ease;
}

.tab:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab.active {
  background: #6366f1;
  color: white;
}

.tab-count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  min-width: 280px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #334155;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border-radius: 14px;
  border: 2px solid transparent;
  padding: 20px;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: #6366f1;
  background: #faf5ff;
}

.template-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.template-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.template-icon svg {
  width: 20px;
  height: 20px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background: #fef3c7;
  color: #d97706;
}

.template-name {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.template-category {
  margin: 0 0 14px;
  font-size: 13px;
  color: #64748b;
}

.template-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.create-time {
  font-size: 12px;
  color: #94a3b8;
}

.action-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 150ms ease;
}

.action-icon:hover {
  background: #e2e8f0;
  color: #334155;
}

.action-icon svg {
  width: 16px;
  height: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #94a3b8;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .tab-container {
    flex-direction: column;
    gap: 12px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .search-box {
    width: 100%;
    min-width: auto;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>