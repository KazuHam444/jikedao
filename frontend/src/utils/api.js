import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  // AI 请求可能耗时较长，增加超时时间到 60s，单次请求可以覆盖此值
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 避免循环依赖：直接从 localStorage 读取 token
    const adminToken = localStorage.getItem('adminToken')
    const token = localStorage.getItem('token')

    if (config.url?.startsWith('/admin')) {
      if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
        // 未授权：清除 localStorage 中的 token 并使用页面跳转到登录页
        if (error.config.url?.startsWith('/admin')) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('admin')
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        ElMessage.error('登录已过期，请重新登录')
        // 使用 location 进行重定向，避免导入 router 引起循环依赖
        window.location.href = '/login'
      } else if (status === 403) {
        ElMessage.error('没有权限访问')
      } else if (status === 404) {
        ElMessage.error('资源不存在')
      } else {
        ElMessage.error(data.message || '请求失败')
      }
    } else {
      // 区分超时和其他网络错误，给出更明确的提示
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        ElMessage.error('请求超时：AI生成可能需要更长时间，请稍候重试或在“回信”页面检查生成结果')
      } else {
        ElMessage.error('网络错误，请检查网络连接')
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

