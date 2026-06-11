import { ref, reactive } from 'vue'
import { login as apiLogin, getInfo, logout as apiLogout, getCodeImg } from '@/api/login'
import { getToken, setToken, removeToken, getWdsToken, setWdsToken } from '@/utils/auth'

const token = ref(getToken() || getWdsToken())
const userInfo = reactive({
  name: '',
  nickName: '',
  avatar: '',
  roles: [],
  permissions: []
})

const state = reactive({
  token: getToken() || getWdsToken(),
  name: '',
  nickName: '',
  avatar: '',
  roles: [],
  permissions: []
})

export function useUserStore() {
  const login = async (userInfoForm) => {
    const { username, password, code, uuid } = userInfoForm
    const res = await apiLogin(username, password, code, uuid)
    // 尝试保存 token 到多个可能的存储位置
    if (res.token) {
      setToken(res.token)
      setWdsToken(res.token)
      state.token = res.token
    }
    return res
  }

  const getUserInfo = async () => {
    const res = await getInfo()
    const user = res.user
    state.name = user.userName
    state.nickName = user.nickName
    state.avatar = user.avatar ? user.avatar : ''
    state.roles = res.roles && res.roles.length > 0 ? res.roles : ['ROLE_DEFAULT']
    state.permissions = res.permissions || []
    return res
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (e) {
      console.warn('Logout API error:', e)
    }
    removeToken()
    state.token = ''
    state.name = ''
    state.nickName = ''
    state.avatar = ''
    state.roles = []
    state.permissions = []
  }

  const getCaptcha = async () => {
    const res = await getCodeImg()
    return res
  }

  const hasToken = () => {
    return !!state.token
  }

  return {
    state,
    login,
    getUserInfo,
    logout,
    getCaptcha,
    hasToken
  }
}