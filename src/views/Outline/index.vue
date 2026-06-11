<script setup>
import { computed, ref } from 'vue';

const status = ref('idle');
const result = ref(null);
const errorMessage = ref('');

const statusText = computed(() => {
  if (status.value === 'loading') return '正在生成';
  if (status.value === 'success') return '已完成';
  if (status.value === 'error') return '生成失败';
  return '待生成';
});

async function generateOutline() {
  if (!window.wts?.generateLatestOutlinePdf) {
    status.value = 'error';
    errorMessage.value = '当前运行环境不支持 PDF 生成，请在 Electron 桌面端中使用。';
    return;
  }

  status.value = 'loading';
  result.value = null;
  errorMessage.value = '';

  const response = await window.wts.generateLatestOutlinePdf();

  if (response.ok) {
    status.value = 'success';
    result.value = response;
    return;
  }

  status.value = 'error';
  errorMessage.value = response.message || '未知错误';
}
</script>

<template>
  <div class="outline-page">
    <header class="page-header">
      <div>
        <span class="page-kicker">技能类别</span>
        <h2>最新试验大纲生成</h2>
        <p>从试验大纲接口获取文本数据，转换为富文本 PDF，并下载到本地。</p>
      </div>
      <span :class="['status-pill', status]">{{ statusText }}</span>
    </header>

    <section class="generator-panel">
      <div class="panel-copy">
        <h3>生成规则</h3>
        <ul>
          <li>数据来源：真实接口占位，当前使用模拟试验大纲数据。</li>
          <li>输出格式：A4 富文本 PDF，包含标题、编号、目标、范围、步骤和验收标准。</li>
          <li>文件名称：本机 IP 地址 + 试验大纲，例如 192.168.1.10试验大纲.pdf。</li>
          <li>保存位置：系统下载目录。</li>
        </ul>
      </div>

      <button class="generate-btn" type="button" :disabled="status === 'loading'" @click="generateOutline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6" />
          <path d="M9 15l3 3 3-3" />
        </svg>
        <span>{{ status === 'loading' ? '生成中...' : '生成并下载 PDF' }}</span>
      </button>
    </section>

    <section v-if="result" class="result-panel">
      <div class="result-header">
        <h3>生成结果</h3>
        <span>{{ result.fileName }}</span>
      </div>
      <dl>
        <div>
          <dt>本机 IP</dt>
          <dd>{{ result.ipAddress }}</dd>
        </div>
        <div>
          <dt>本地路径</dt>
          <dd>{{ result.filePath }}</dd>
        </div>
        <div>
          <dt>大纲编号</dt>
          <dd>{{ result.outline.code }}</dd>
        </div>
        <div>
          <dt>生成时间</dt>
          <dd>{{ result.outline.generatedAt }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="errorMessage" class="error-panel">
      {{ errorMessage }}
    </section>
  </div>
</template>

<style scoped>
.outline-page {
  min-height: 100vh;
  padding: 24px;
  background: #f8f9fa;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.page-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
}

.page-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

.status-pill {
  padding: 7px 11px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-pill.loading {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-pill.success {
  background: #d1fae5;
  color: #047857;
}

.status-pill.error {
  background: #fee2e2;
  color: #b91c1c;
}

.generator-panel,
.result-panel,
.error-panel {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.generator-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px;
}

.panel-copy h3,
.result-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
}

.panel-copy ul {
  display: grid;
  gap: 9px;
  margin: 14px 0 0;
  padding-left: 18px;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

.generate-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 158px;
  padding: 11px 15px;
  border: 0;
  border-radius: 8px;
  background: #6366f1;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.generate-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.generate-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.generate-btn svg {
  width: 17px;
  height: 17px;
}

.result-panel {
  margin-top: 16px;
  padding: 20px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.result-header span {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

dl div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

dt {
  color: #94a3b8;
  font-size: 12px;
}

dd {
  margin: 0;
  color: #334155;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.error-panel {
  margin-top: 16px;
  padding: 14px 16px;
  color: #b91c1c;
  background: #fef2f2;
}

@media (max-width: 760px) {
  .page-header,
  .generator-panel,
  .result-header {
    flex-direction: column;
  }

  dl {
    grid-template-columns: 1fr;
  }
}
</style>