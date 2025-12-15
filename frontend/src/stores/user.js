import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const adminToken = ref(localStorage.getItem('adminToken') || '')
  const admin = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => !!adminToken.value)

  // 用户登录
  async function login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password })
      if (response.data.success) {
        // 普通用户登录时，清除管理员token
        adminToken.value = ''
        admin.value = null
        localStorage.removeItem('adminToken')
        
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('token', token.value)
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败'
      }
    }
  }

  // 用户注册
  async function register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        return { success: true, message: '注册成功' }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败'
      }
    }
  }

  // 管理员登录
  async function adminLogin(username, password) {
    try {
      const response = await api.post('/auth/admin/login', { username, password })
      if (response.data.success) {
        // 管理员登录时，清除普通用户token
        token.value = ''
        user.value = null
        localStorage.removeItem('token')
        
        adminToken.value = response.data.data.token
        admin.value = response.data.data.admin
        localStorage.setItem('adminToken', adminToken.value)
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败'
      }
    }
  }

  // 获取当前用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const response = await api.get('/users/me')
      if (response.data.success) {
        user.value = response.data.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
    }
  }

  // 登出
  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  // 管理员登出
  function adminLogout() {
    adminToken.value = ''
    admin.value = null
    localStorage.removeItem('adminToken')
  }

  // 初始化：如果有token，获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    token,
    user,
    adminToken,
    admin,
    isAuthenticated,
    isAdmin,
    login,
    register,
    adminLogin,
    fetchUserInfo,
    logout,
    adminLogout
  }
})

