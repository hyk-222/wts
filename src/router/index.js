import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout/index.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/views/Chat/index.vue'),
        meta: {
          title: 'WTS 协同工作'
        }
      },
      {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('@/views/Tasks/index.vue'),
        meta: {
          title: '任务管理'
        }
      },
      {
        path: '/outline',
        name: 'Outline',
        component: () => import('@/views/Outline/index.vue'),
        meta: {
          title: '试验大纲生成'
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const isLoggedIn = userStore.hasToken()

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  if (requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router