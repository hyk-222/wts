import { ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

export function useChat() {
  const chatStore = useChatStore()
  const chatHistoryBox = ref(null)

  // 键盘事件处理
  const handleKeyup = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 建议按钮点击
  const handleSuggestionClick = (suggestion) => {
    chatStore.inputMessage.value = suggestion.text
    sendMessage()
  }

  // 发送消息
  const sendMessage = () => {
    if (!chatStore.inputMessage.value.trim()) return
    chatStore.sendMessage(chatStore.inputMessage.value)
    nextTick(() => scrollToBottom(true))
  }

  // 滚动到底部
  const scrollToBottom = (force = false) => {
    nextTick(() => {
      if (chatHistoryBox.value) {
        chatHistoryBox.value.scrollTo({
          top: chatHistoryBox.value.scrollHeight,
          behavior: force ? 'smooth' : 'auto'
        })
      }
    })
  }

  // 滚动处理
  const handleScroll = (e) => {
    const el = e.target
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    chatStore.setShowScrollBottomBtn(distanceToBottom > 100)
  }

  // 强制滚动到底部
  const forceScrollToBottom = () => {
    chatStore.setShowScrollBottomBtn(false)
    scrollToBottom(true)
  }

  // 绑定聊天历史容器
  const bindChatHistoryBox = (el) => {
    chatHistoryBox.value = el
  }

  return {
    // 状态（从store获取）
    messages: chatStore.messages,
    currentAgentType: chatStore.currentAgentType,
    isNewSession: chatStore.isNewSession,
    loading: chatStore.loading,
    inputMessage: chatStore.inputMessage,
    dynamicPlaceholder: chatStore.dynamicPlaceholder,
    agentTypes: chatStore.agentTypes,
    showScrollBottomBtn: chatStore.showScrollBottomBtn,
    // 方法
    sendMessage,
    handleKeyup,
    handleSuggestionClick,
    toggleAgent: chatStore.toggleAgent,
    startNewChat: chatStore.startNewChat,
    setMessageScore: chatStore.setMessageScore,
    copyText: chatStore.copyText,
    scrollToBottom,
    handleScroll,
    forceScrollToBottom,
    bindChatHistoryBox
  }
}