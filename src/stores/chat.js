import { ref, reactive, computed } from 'vue'

// 智能体类型配置
const agentTypes = [
  { type: 'device', name: '设备问答', icon: 'device', color: '#3b82f6', bgColor: '#e8f0fe' },
  { type: 'fault', name: '故障诊断', icon: 'fault', color: '#f59e0b', bgColor: '#fff3e0' },
  { type: 'business', name: '业务问答', icon: 'business', color: '#10b981', bgColor: '#d1fae5' }
]

// 会话列表
const sessionList = ref([])

// 当前会话ID
const currentSessionId = ref(null)

// 当前智能体类型
const currentAgentType = ref('default')

// 当前会话消息列表
const messages = ref([])

// 输入消息
const inputMessage = ref('')

// 加载状态
const loading = ref(false)

// 是否新会话
const isNewSession = computed(() => !currentSessionId.value && messages.value.length === 0)

// 动态占位符
const dynamicPlaceholder = computed(() => {
  if (currentAgentType.value === 'device') {
    return '在此输入设备相关问题... (当前设备专家, Enter 发送，Shift + Enter 换行)'
  }
  if (currentAgentType.value === 'fault') {
    return '在此输入异常现象或报错代码... (当前排障专家, Enter 发送，Shift + Enter 换行)'
  }
  if (currentAgentType.value === 'business') {
    return '在此输入业务流程相关问题... (当前业务专家, Enter 发送，Shift + Enter 换行)'
  }
  return '帮你整理论文综述、编写 PPT、分析 Excel 等日常工作，输出专业工作成果。'
})

export function useChatStore() {
  // 切换智能体
  const toggleAgent = (type) => {
    if (currentAgentType.value === type) {
      currentAgentType.value = 'default'
    } else {
      currentAgentType.value = type
    }
  }

  // 添加消息
  const addMessage = (message) => {
    messages.value.push(message)
  }

  // 发送消息
  const sendMessage = async (content) => {
    if (!content.trim()) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: content,
      timestamp: '刚刚',
      showActions: false,
      isEditing: false
    }
    messages.value.push(userMsg)
    inputMessage.value = ''
    loading.value = true

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
    }
    messages.value.push(aiMsgRef)

    // 模拟AI响应
    setTimeout(() => {
      aiMsgRef.thinkingText = '检索知识库...'
    }, 2000)

    setTimeout(() => {
      aiMsgRef.thinkingText = '正在组织回答...'
    }, 4000)

    setTimeout(() => {
      loading.value = false
      aiMsgRef.isLoading = false
      aiMsgRef.content = `我已收到您的请求："${content}"。\n\n我将为您处理相关工作，包括分析需求、整理资料、生成专业成果。\n\n请问您还需要我做什么？`
      aiMsgRef.suggestions = [
        { text: '继续深入分析', action: 'deep-analyze' },
        { text: '生成总结报告', action: 'summary-report' },
        { text: '导出结果', action: 'export-result' }
      ]
    }, 2500)
  }

  // 开始新对话
  const startNewChat = () => {
    messages.value = []
    currentSessionId.value = null
    currentAgentType.value = 'default'
  }

  // 加载历史会话
  const loadSession = (session) => {
    currentSessionId.value = session.sessionId
    // 这里应该从API加载消息，现在模拟
    messages.value = session.messages || []
  }

  // 设置消息分数（赞同/不赞同）
  const setMessageScore = (messageId, score) => {
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) {
      msg.score = msg.score === score ? null : score
    }
  }

  // 复制文本
  const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('内容已复制')
    }).catch(() => {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        alert('内容已复制')
      } catch (err) {
        alert('复制失败')
      }
      document.body.removeChild(textarea)
    })
  }

  return {
    // 状态
    sessionList,
    currentSessionId,
    currentAgentType,
    messages,
    inputMessage,
    loading,
    isNewSession,
    dynamicPlaceholder,
    agentTypes,
    // 方法
    toggleAgent,
    addMessage,
    sendMessage,
    startNewChat,
    loadSession,
    setMessageScore,
    copyText
  }
}