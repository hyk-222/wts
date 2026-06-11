import { ref } from 'vue'

// 侧边栏折叠状态
const isSidebarCollapsed = ref(true)

// 聊天侧边栏折叠状态
const isChatSidebarCollapsed = ref(true)

// 主题模式
const themeMode = ref('light')

// 是否显示滚动到底部按钮
const showScrollBottomBtn = ref(false)

// 是否聚焦输入框
const isInputFocused = ref(false)

// 搜索查询
const searchQuery = ref('')

export function useAppStore() {
  // 切换侧边栏
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed) => {
    isSidebarCollapsed.value = collapsed
  }

  // 切换聊天侧边栏
  const toggleChatSidebar = () => {
    isChatSidebarCollapsed.value = !isChatSidebarCollapsed.value
  }

  // 设置聊天侧边栏状态
  const setChatSidebarCollapsed = (collapsed) => {
    isChatSidebarCollapsed.value = collapsed
  }

  // 切换主题
  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  // 设置主题
  const setTheme = (theme) => {
    themeMode.value = theme
  }

  // 设置滚动按钮显示状态
  const setShowScrollBottomBtn = (show) => {
    showScrollBottomBtn.value = show
  }

  // 设置输入框聚焦状态
  const setInputFocused = (focused) => {
    isInputFocused.value = focused
  }

  return {
    // 状态
    isSidebarCollapsed,
    isChatSidebarCollapsed,
    themeMode,
    showScrollBottomBtn,
    isInputFocused,
    searchQuery,
    // 方法
    toggleSidebar,
    setSidebarCollapsed,
    toggleChatSidebar,
    setChatSidebarCollapsed,
    toggleTheme,
    setTheme,
    setShowScrollBottomBtn,
    setInputFocused
  }
}