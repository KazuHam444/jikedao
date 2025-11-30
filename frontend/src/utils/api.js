import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    
    // 如果是管理员路由，使用管理员token
    if (config.url?.startsWith('/admin')) {
      if (userStore.adminToken) {
        config.headers.Authorization = `Bearer ${userStore.adminToken}`
      }
    } else if (userStore.token) {
      // 普通用户路由使用用户token
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        // 未授权，清除token并跳转到登录页
        const userStore = useUserStore()
        if (error.config.url?.startsWith('/admin')) {
          userStore.adminLogout()
        } else {
          userStore.logout()
        }
        ElMessage.error('登录已过期，请重新登录')
        router.push({ name: 'login' })
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('资源不存在')
      } else {
        ElMessage.error(data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default api

