import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录', requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { title: '注册', requiresGuest: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue'),
      meta: { title: '管理员登录' }
    },
    {
      path: '/letters',
      name: 'letters',
      component: () => import('../views/Letters.vue'),
      meta: { title: '我的信件', requiresAuth: true }
    },
    {
      path: '/write',
      name: 'write',
      component: () => import('../views/Write.vue'),
      meta: { title: '写信', requiresAuth: true }
    },
    {
      path: '/replies',
      name: 'replies',
      component: () => import('../views/Replies.vue'),
      meta: { title: '回信', requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { title: '通知', requiresAuth: true }
    },
    {
      path: '/featured',
      name: 'featured',
      component: () => import('../views/FeaturedLetters.vue'),
      meta: { title: '精选信件' }
    },
    {
      path: '/letter/:id',
      name: 'letter-detail',
      component: () => import('../views/LetterDetail.vue'),
      meta: { title: '信件详情' }
    },
    {
      path: '/send-success/:id',
      name: 'send-success',
      component: () => import('../views/SendSuccess.vue'),
      meta: { title: '发送成功' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { title: '管理员', requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue'),
          meta: { title: '管理后台' }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/Users.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'letters',
          name: 'admin-letters',
          component: () => import('../views/admin/AdminLetters.vue'),
          meta: { title: '信件管理' }
        },
        {
          path: 'figures',
          name: 'admin-figures',
          component: () => import('../views/admin/Figures.vue'),
          meta: { title: '历史人物管理' }
        },
        {
          path: 'styles',
          name: 'admin-styles',
          component: () => import('../views/admin/Styles.vue'),
          meta: { title: '样式管理' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 延迟导入 store，避免在路由模块初始化时访问 Pinia（可能尚未安装）
  const { useUserStore } = await import('../stores/user')
  const userStore = useUserStore()

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 需要管理员的页面
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  // 已登录用户不能访问登录/注册页
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router

