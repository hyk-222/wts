<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCookie, setCookie, removeCookie, encrypt, decrypt } from '@/utils/auth'

const emit = defineEmits(['login-success'])
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: '',
  code: '',
  rememberMe: false,
  uuid: ''
})

const codeUrl = ref('')
const loading = ref(false)
const errorMsg = ref('')
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)
const isCodeFocused = ref(false)

// 从Cookie读取记住的密码
const getCookieLogin = () => {
  const username = getCookie('username')
  const password = getCookie('password')
  const rememberMe = getCookie('rememberMe')
  if (username) {
    loginForm.value.username = username
  }
  if (password) {
    const decrypted = decrypt(password)
    loginForm.value.password = decrypted || ''
  }
  if (rememberMe) {
    loginForm.value.rememberMe = rememberMe === 'true'
  }
}

const getCode = async () => {
  try {
    const res = await userStore.getCaptcha()
    codeUrl.value = 'data:image/gif;base64,' + res.img
    loginForm.value.uuid = res.uuid
  } catch (e) {
    console.error('获取验证码失败:', e)
    codeUrl.value = ''
  }
}

const handleLogin = async () => {
  if (!loginForm.value.username) {
    errorMsg.value = '请输入用户名'
    return
  }
  if (!loginForm.value.password) {
    errorMsg.value = '请输入密码'
    return
  }
  if (!loginForm.value.code) {
    errorMsg.value = '请输入验证码'
    return
  }

  errorMsg.value = ''
  loading.value = true

  try {
    // 处理记住密码
    if (loginForm.value.rememberMe) {
      setCookie('username', loginForm.value.username, { expires: 30 })
      setCookie('password', encrypt(loginForm.value.password), { expires: 30 })
      setCookie('rememberMe', String(loginForm.value.rememberMe), { expires: 30 })
    } else {
      removeCookie('username')
      removeCookie('password')
      removeCookie('rememberMe')
    }

    // 对密码进行RSA加密后发送给后端
    const encryptedPassword = encrypt(loginForm.value.password)
    if (!encryptedPassword) {
      errorMsg.value = '密码加密失败'
      return
    }

    await userStore.login({
      ...loginForm.value,
      password: encryptedPassword
    })
    await userStore.getUserInfo()
    emit('login-success', userStore.state)
  } catch (e) {
    errorMsg.value = e.message || '登录失败，请重试'
    getCode()
  } finally {
    loading.value = false
  }
}

const handleKeyup = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

onMounted(() => {
  getCode()
  getCookieLogin()
})
</script>

<template>
  <div class="login-page">
    <!-- 装饰背景 -->
    <div class="bg-decoration">
      <div class="decoration-orb orb-1"></div>
      <div class="decoration-orb orb-2"></div>
      <div class="decoration-orb orb-3"></div>
    </div>

    <div class="login-container">
      <!-- 品牌区 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="welcome-text">
            <h2>欢迎回来</h2>
            <p>登录以继续使用 WTS 协同工作</p>
          </div>
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h1 class="brand-title">
            WTS<span class="gradient-text">协同工作</span>
          </h1>
        </div>
      </div>

      <!-- 登录区 -->
      <div class="login-section">
        <div class="login-card">

          <form class="login-form" @submit.prevent="handleLogin">
            <div v-if="errorMsg" class="error-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg }}
            </div>

            <div class="form-group">
              <label class="form-label">用户名</label>
              <div class="input-wrapper" :class="{ focused: isUsernameFocused }">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="请输入用户名"
                  @focus="isUsernameFocused = true"
                  @blur="isUsernameFocused = false"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="input-wrapper" :class="{ focused: isPasswordFocused }">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  @focus="isPasswordFocused = true"
                  @blur="isPasswordFocused = false"
                  @keyup="handleKeyup"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">验证码</label>
              <div class="input-wrapper captcha-wrapper" :class="{ focused: isCodeFocused }">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <input
                  v-model="loginForm.code"
                  type="text"
                  placeholder="请输入验证码"
                  @focus="isCodeFocused = true"
                  @blur="isCodeFocused = false"
                  @keyup="handleKeyup"
                  class="form-input captcha-input"
                />
                <div class="captcha-img" @click="getCode">
                  <img v-if="codeUrl" :src="codeUrl" alt="验证码" />
                  <span v-else>点击获取</span>
                </div>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="loginForm.rememberMe" type="checkbox" class="checkbox" />
                <span class="checkbox-custom"></span>
                <span>记住密码</span>
              </label>
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <span>{{ loading ? '登录中...' : '登 录' }}</span>
            </button>
          </form>

          <div class="login-footer">
            <span>© 2026 潍柴动力 产品试验中心</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 12s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  bottom: -100px;
  left: -100px;
  animation-delay: -4s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -8s;
  opacity: 0.08;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.05); }
  50% { transform: translate(-15px, 15px) scale(0.95); }
  75% { transform: translate(10px, -10px) scale(1.02); }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 1000px;
  height: 600px;
  margin: 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e5e5e5;
}

.brand-content {
  text-align: center;
}

.welcome-text {
  margin-bottom: 32px;
}

.welcome-text h2 {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px;
}

.welcome-text p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.brand-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
}

.brand-logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* 登录区 */
.login-section {
  flex: 0 0 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 320px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  animation: shake 0.3s ease;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  transition: all 200ms ease;
}

.input-wrapper.focused {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
}

.input-icon {
  width: 18px;
  height: 18px;
  margin-left: 14px;
  color: #94a3b8;
  transition: color 200ms ease;
  flex-shrink: 0;
}

.input-wrapper.focused .input-icon {
  color: #6366f1;
}

.form-input {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  outline: none;
  color: #0f172a;
  font-size: 14px;
}

.form-input::placeholder {
  color: #94a3b8;
}

.captcha-wrapper {
  gap: 0px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  padding: 4px 6px;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 200ms ease;
  min-width: 70px;
  max-width: 80px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.captcha-img:hover {
  background: #e2e8f0;
}

.captcha-img img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
  object-fit: contain;
}

.captcha-img span {
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
}

.form-options {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #64748b;
  font-size: 13px;
  user-select: none;
}

.checkbox {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #cbd5e1;
  position: relative;
  transition: all 200ms ease;
  flex-shrink: 0;
}

.checkbox:checked + .checkbox-custom {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: #6366f1;
}

.checkbox:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 4.5px;
  top: 1.5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.login-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.login-footer span {
  color: #94a3b8;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    height: auto;
    min-height: 600px;
    margin: 16px;
  }

  .brand-section {
    padding: 48px 32px;
    border-right: none;
    border-bottom: 1px solid #e5e5e5;
  }

  .brand-title {
    font-size: 28px;
  }

  .login-section {
    flex: none;
    padding: 32px;
  }
}

@media (max-width: 480px) {
  .login-container {
    margin: 0;
    border-radius: 0;
    height: 100vh;
    min-height: 100vh;
  }

  .brand-section {
    padding: 40px 24px;
  }

  .login-section {
    padding: 24px;
  }

  .login-card {
    max-width: 100%;
  }
}
</style>