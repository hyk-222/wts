<template>
  <div class="message-list">
    <TransitionGroup name="msg-slide" tag="div" class="msg-transition-wrapper">
      <div 
        v-for="(msg, index) in messages" 
        :key="(msg.logId ? msg.logId + '-' : '') + msg.role + '-' + index"
        class="message-item"
        :class="[msg.role]"
      >
        <!-- AI头像 -->
        <div class="avatar" v-if="msg.role === 'ai'">
          <img :src="aiIconUrl" alt="PT AI" />
        </div>

        <!-- 用户消息 -->
        <div 
          v-if="msg.role === 'user'" 
          class="message-content user-content"
          @mouseenter="msg.showActions = true"
          @mouseleave="msg.showActions = false"
        >
          <template v-if="!msg.isEditing">
            {{ msg.content }}
            <Transition name="el-fade-in">
              <div class="user-actions" v-show="msg.showActions">
                <el-tooltip content="重新发送" placement="top" :enterable="false">
                  <i class="el-icon-refresh-right" @click="$emit('resend', msg, index)"></i>
                </el-tooltip>
                <el-tooltip content="编辑" placement="top" :enterable="false">
                  <i class="el-icon-edit" @click="$emit('edit', msg)"></i>
                </el-tooltip>
                <el-tooltip content="复制" placement="top" :enterable="false">
                  <i class="el-icon-copy-document" @click="$emit('copy', msg.content)"></i>
                </el-tooltip>
              </div>
            </Transition>
          </template>
          <template v-else>
            <el-input 
              type="textarea" 
              :autosize="{ minRows: 2, maxRows: 6 }" 
              v-model="msg.tempContent"
              class="edit-textarea"
            ></el-input>
            <div class="edit-actions">
              <el-button size="small" type="text" class="cancel-btn" @click="msg.isEditing = false">取消</el-button>
              <el-button size="small" type="primary" class="flat-primary-btn" @click="$emit('submit-edit', msg, index)">重新发送</el-button>
            </div>
          </template>
        </div>

        <!-- AI消息 -->
        <div v-else class="message-content ai-content">
          <!-- 加载状态 -->
          <div v-if="msg.isLoading" class="premium-thinking-container">
            <div class="thinking-badge">
              <i class="el-icon-loading thinking-icon"></i>
              <span class="thinking-text-glow">{{ msg.thinkingText }}</span>
              <span class="thinking-timer">已用时 {{ msg.elapsedTime || 0 }}s</span>
              <el-tooltip content="停止生成" placement="top">
                <div class="stop-generate-btn" @click.stop="$emit('stop-generation')">
                  <i class="el-icon-video-pause"></i>
                </div>
              </el-tooltip>
              <div class="thinking-dots">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          </div>

          <!-- 内容 -->
          <div 
            v-else-if="msg.content || msg.isTyping" 
            class="markdown-body" 
            v-html="msg.renderedContent"
            @click="handleMarkdownClick($event, msg)"
          ></div>

          <!-- 知识溯源 -->
          <Transition name="el-fade-in-linear">
            <div class="references-section"
              v-if="msg.references && msg.references.length > 0 && !msg.isLoading && !msg.isTyping">
              <div class="ref-title"><i class="el-icon-link"></i> 知识溯源</div>
              <div class="ref-list">
                <div class="ref-item"
                  v-for="ref in (msg.isRefsExpanded ? msg.references : msg.references.slice(0, 8))" 
                  :key="ref.id"
                  @click="$emit('open-reference', ref.id, msg.references)">
                  <span class="ref-index">[{{ ref.id }}]</span>
                  <span class="ref-name" :title="getDocumentName(ref)">{{ getDocumentName(ref) }}</span>
                </div>

                <div class="ref-toggle-btn" v-if="msg.references.length > 8"
                  @click="msg.isRefsExpanded = !msg.isRefsExpanded">
                  <template v-if="!msg.isRefsExpanded">
                    <i class="el-icon-arrow-down"></i> 展开剩余 {{ msg.references.length - 8 }} 项
                  </template>
                  <template v-else>
                    <i class="el-icon-arrow-up"></i> 收起文献
                  </template>
                </div>
              </div>
            </div>
          </Transition>

          <!-- 反馈区域 -->
          <Transition name="el-zoom-in-top">
            <div class="ai-feedback-section" v-if="msg.logId && !msg.isLoading && !msg.isTyping">
              <div class="message-actions">
                <!-- 版本切换 -->
                <div class="version-controller" v-if="msg.answerVersions && msg.answerVersions.length > 1">
                  <i class="el-icon-arrow-left" :class="{ disabled: msg.currentVersionIndex === 0 }"
                    @click="$emit('switch-version', msg, -1)"></i>
                  <span class="version-text">{{ msg.currentVersionIndex + 1 }} / {{ msg.answerVersions.length }}</span>
                  <i class="el-icon-arrow-right"
                    :class="{ disabled: msg.currentVersionIndex === msg.answerVersions.length - 1 }"
                    @click="$emit('switch-version', msg, 1)"></i>
                  <div class="action-divider"></div>
                </div>

                <!-- 复制 -->
                <el-tooltip content="复制" placement="top" :enterable="false">
                  <div class="action-btn" @click="$emit('copy', msg.content)">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2"
                      fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </div>
                </el-tooltip>

                <div class="action-divider"></div>

                <!-- 赞同 -->
                <el-tooltip content="赞同" placement="top" :enterable="false">
                  <div class="action-btn" :class="{ 'is-active': msg.score === 1 }" @click="$emit('toggle-score', msg, 1)">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2"
                      fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </div>
                </el-tooltip>

                <!-- 不赞同 -->
                <el-tooltip content="不赞同" placement="top" :enterable="false">
                  <div class="action-btn" :class="{ 'is-active': msg.score === 0 }" @click="$emit('toggle-score', msg, 0)">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2"
                      fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                    </svg>
                  </div>
                </el-tooltip>
              </div>

              <!-- 反馈输入框 -->
              <div class="feedback-input-wrapper" v-show="msg.showCommentBox">
                <el-input 
                  type="textarea" 
                  :rows="2" 
                  placeholder="请详细描述您的反馈，帮助我们改进模型..." 
                  v-model="msg.comment"
                  maxlength="500" 
                  resize="none" 
                  class="premium-textarea"
                ></el-input>
                <div class="feedback-actions">
                  <el-button size="mini" type="text" class="cancel-btn" @click="msg.showCommentBox = false">收起</el-button>
                  <el-button type="primary" size="mini" class="flat-primary-btn" @click="$emit('submit-comment', msg)">提交反馈</el-button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import aiIcon from '@/assets/image/ai-icon.png';

const aiIconUrl = aiIcon;

defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'copy', 
  'toggle-score', 
  'submit-comment', 
  'edit', 
  'submit-edit', 
  'resend', 
  'switch-version',
  'stop-generation',
  'open-reference'
]);

const getDocumentName = (ref) => {
  return ref.document_name ? (ref.dataset_name + '-' + ref.document_name) : '参考文档';
};

const handleMarkdownClick = (e, msg) => {
  let target = e.target;
  while (target && target !== e.currentTarget) {
    if (target.classList && target.classList.contains('citation-badge')) {
      const refId = target.getAttribute('data-ref');
      emit('open-reference', refId, msg.references);
      return;
    }
    if (target.classList && target.classList.contains('code-copy-btn')) {
      const codeBlock = target.closest('.code-block-wrapper').querySelector('code');
      const code = codeBlock.textContent;
      emit('copy', code);
      return;
    }
    target = target.parentNode;
  }
};
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.msg-transition-wrapper {
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

/* 头像 */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 用户消息 */
.user-content {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  padding: 14px 18px;
  border-radius: 18px 18px 4px 18px;
  max-width: 70%;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  position: relative;
  margin-left: auto;
}

.user-content .user-actions {
  position: absolute;
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
}

.user-actions i {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.user-actions i:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* 编辑区域 */
.edit-textarea {
  width: 100%;
  min-height: 60px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.cancel-btn {
  color: #6b7280 !important;
}

.flat-primary-btn {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

/* AI消息 */
.ai-content {
  flex: 1;
  min-width: 0;
}

/* 思考状态 */
.premium-thinking-container {
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 4px 18px 18px 18px;
}

.thinking-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thinking-icon {
  font-size: 18px;
  color: #3b82f6;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.thinking-text-glow {
  font-size: 14px;
  color: #5f6368;
}

.thinking-timer {
  font-size: 12px;
  color: #9aa0a6;
}

.stop-generate-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #d1d5db;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.stop-generate-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
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

/* Markdown内容 */
.markdown-body {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 14px 18px;
  border-radius: 4px 18px 18px 18px;
  font-size: 14px;
  line-height: 1.7;
  color: #3c4043;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.markdown-body h1 { font-size: 1.5em; }
.markdown-body h2 { font-size: 1.3em; }
.markdown-body h3 { font-size: 1.1em; }

.markdown-body p { margin: 8px 0; }
.markdown-body ul, .markdown-body ol { padding-left: 20px; margin: 8px 0; }
.markdown-body li { margin: 4px 0; }

.markdown-body code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  background: #1f2937;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: #e5e7eb;
}

.markdown-body blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 12px;
  margin: 12px 0;
  color: #6b7280;
  font-style: italic;
}

/* 知识溯源 */
.references-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.ref-title {
  font-size: 13px;
  font-weight: 600;
  color: #5f6368;
  margin-bottom: 12px;
}

.ref-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 12px;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.2s;
}

.ref-item:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.ref-index {
  font-weight: 600;
}

.ref-toggle-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
}

/* 反馈区域 */
.ai-feedback-section {
  margin-top: 16px;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.version-controller {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-controller i {
  cursor: pointer;
  color: #9aa0a6;
  font-size: 14px;
}

.version-controller i.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.version-text {
  font-size: 12px;
  color: #9aa0a6;
}

.action-divider {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #9aa0a6;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #5f6368;
}

.action-btn.is-active {
  color: #1a73e8;
  background: rgba(26, 115, 232, 0.1);
}

/* 反馈输入框 */
.feedback-input-wrapper {
  margin-top: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.premium-textarea {
  width: 100%;
  min-height: 60px;
  font-size: 13px;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
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