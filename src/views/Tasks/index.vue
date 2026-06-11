<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1 class="page-title">任务管理</h1>
      <p class="page-subtitle">管理和追踪您的工作任务</p>
    </div>

    <div class="tasks-container">
      <!-- 任务统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            <i class="el-icon-list"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">24</div>
            <div class="stat-label">总任务数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(234, 67, 53, 0.1); color: #ea4335;">
            <i class="el-icon-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">8</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="el-icon-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            <i class="el-icon-alert"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">4</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-section">
        <div class="section-header">
          <h2 class="section-title">任务列表</h2>
          <el-button type="primary" size="small" @click="showAddTask = true">
            <i class="el-icon-plus"></i> 新建任务
          </el-button>
        </div>

        <div class="task-filters">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            class="filter-btn"
            :class="{ 'is-active': activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="task-list">
          <div v-for="task in filteredTasks" :key="task.id" class="task-card">
            <div class="task-checkbox">
              <input type="checkbox" :checked="task.completed" @change="toggleTask(task)">
            </div>
            <div class="task-content">
              <h3 class="task-title" :class="{ 'is-completed': task.completed }">{{ task.title }}</h3>
              <p class="task-desc">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-priority" :class="task.priority">
                  {{ getPriorityLabel(task.priority) }}
                </span>
                <span class="task-status" :class="task.status">
                  {{ getStatusLabel(task.status) }}
                </span>
                <span class="task-date">{{ task.date }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn" @click="editTask(task)">
                <i class="el-icon-edit"></i>
              </button>
              <button class="action-btn" @click="deleteTask(task)">
                <i class="el-icon-delete"></i>
              </button>
            </div>
          </div>

          <div v-if="filteredTasks.length === 0" class="empty-state">
            <i class="el-icon-box"></i>
            <p>暂无任务</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加任务弹窗 -->
    <el-dialog title="新建任务" :visible.sync="showAddTask" width="480px">
      <form @submit.prevent="addTask">
        <el-form-item label="任务标题">
          <el-input v-model="newTask.title" placeholder="请输入任务标题"></el-input>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-textarea v-model="newTask.description" placeholder="请输入任务描述"></el-textarea>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addTask">创建任务</el-button>
          <el-button @click="showAddTask = false">取消</el-button>
        </el-form-item>
      </form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showAddTask = ref(false)
const activeFilter = ref('all')

const filters = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'completed' }
]

const tasks = ref([
  { id: 1, title: '完成试验报告', description: '整理并提交Q3季度试验报告', priority: 'high', status: 'in-progress', date: '2024-01-15', completed: false },
  { id: 2, title: '设备维护检查', description: '检查设备运行状态并记录', priority: 'medium', status: 'pending', date: '2024-01-16', completed: false },
  { id: 3, title: '团队会议', description: '组织周例会并准备会议材料', priority: 'low', status: 'completed', date: '2024-01-14', completed: true },
  { id: 4, title: '数据汇总分析', description: '汇总本月试验数据并进行分析', priority: 'high', status: 'in-progress', date: '2024-01-15', completed: false },
  { id: 5, title: '文档归档', description: '整理历史文档并归档', priority: 'low', status: 'pending', date: '2024-01-17', completed: false },
  { id: 6, title: '系统升级', description: '准备系统升级方案', priority: 'medium', status: 'completed', date: '2024-01-13', completed: true }
])

const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  date: new Date().toISOString().split('T')[0]
})

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  return tasks.value.filter(t => t.status === activeFilter.value)
})

const getPriorityLabel = (priority) => {
  const labels = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return labels[priority] || priority
}

const getStatusLabel = (status) => {
  const labels = { 'pending': '待处理', 'in-progress': '进行中', 'completed': '已完成' }
  return labels[status] || status
}

const toggleTask = (task) => {
  task.completed = !task.completed
  task.status = task.completed ? 'completed' : 'pending'
}

const addTask = () => {
  if (!newTask.value.title) return
  tasks.value.unshift({
    id: Date.now(),
    ...newTask.value,
    completed: false
  })
  newTask.value = { title: '', description: '', priority: 'medium', status: 'pending', date: new Date().toISOString().split('T')[0] }
  showAddTask.value = false
}

const editTask = (task) => {
  alert(`编辑任务: ${task.title}`)
}

const deleteTask = (task) => {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index > -1) {
    tasks.value.splice(index, 1)
  }
}
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  padding: 24px;
  background: #f8f9fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #9aa0a6;
  margin: 0;
}

.tasks-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #9aa0a6;
}

/* 任务列表区域 */
.tasks-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* 过滤器 */
.task-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f1f3f4;
  color: #5f6368;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #e8eaed;
}

.filter-btn.is-active {
  background: #3b82f6;
  color: #fff;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.task-checkbox {
  margin-top: 4px;
}

.task-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.task-title.is-completed {
  text-decoration: line-through;
  color: #9aa0a6;
}

.task-desc {
  font-size: 13px;
  color: #5f6368;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 12px;
}

.task-priority {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.task-priority.high {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.task-priority.medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.task-priority.low {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.task-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.task-status.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.task-status.in-progress {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.task-status.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.task-date {
  font-size: 12px;
  color: #9aa0a6;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9aa0a6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e8eaed;
  color: #5f6368;
}

.action-btn:last-child:hover {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #9aa0a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .task-meta {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>