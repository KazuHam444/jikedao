<template>
  <div class="top-navbar">
    <div class="navbar-content">
      <!-- Logo -->
      <div class="logo-container" @click="goHome">
        <span class="logo-text">跨时空邮局</span>
      </div>
      
      <!-- 导航菜单 -->
      <div class="nav-menu">
        <div class="nav-menu-inner">
          <div 
            class="nav-item" 
            :class="{ active: activeMenu === '/' }"
            @click="router.push('/')"
          >
            首页
          </div>
          <!-- 普通用户菜单：只在普通用户登录且不是管理员时显示 -->
          <template v-if="userStore.isAuthenticated && !userStore.isAdmin">
            <div 
              class="nav-item" 
              :class="{ active: activeMenu === '/write' }"
              @click="router.push('/write')"
            >
              写信
            </div>
            <div 
              class="nav-item" 
              :class="{ active: activeMenu === '/replies' }"
              @click="router.push('/replies')"
            >
              回信
            </div>
            <div 
              class="nav-item" 
              :class="{ active: activeMenu === '/letters' }"
              @click="router.push('/letters')"
            >
              我的信件
            </div>
          </template>
          <!-- 精选信件：所有用户都可以访问 -->
          <div 
            class="nav-item" 
            :class="{ active: activeMenu === '/featured' }"
            @click="router.push('/featured')"
          >
            精选信件
          </div>
          <!-- 管理员菜单：只在管理员登录时显示 -->
          <div 
            v-if="userStore.isAdmin && !userStore.isAuthenticated"
            class="nav-item" 
            :class="{ active: activeMenu.startsWith('/admin') }"
            @click="router.push('/admin')"
          >
            管理后台
          </div>
        </div>
      </div>
      
      <!-- 用户操作 -->
      <div class="user-actions">
        <!-- 普通用户操作 -->
        <template v-if="userStore.isAuthenticated && !userStore.isAdmin">
          <el-button type="text" @click="$router.push('/notifications')" class="notification-btn">
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="item">
              <el-icon><Bell /></el-icon>
            </el-badge>
            <el-icon v-else><Bell /></el-icon>
          </el-button>
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.user?.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <!-- 管理员操作 -->
        <template v-else-if="userStore.isAdmin && !userStore.isAuthenticated">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.admin?.username || '管理员' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleAdminLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <!-- 未登录 -->
        <template v-else>
          <el-button type="primary" size="small" @click="$router.push('/login')">登录</el-button>
          <el-button size="small" @click="$router.push('/register')">注册</el-button>
          <el-button type="info" size="small" @click="$router.push('/admin/login')">管理员</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Bell, User } from '@element-plus/icons-vue'
import api from '../utils/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const unreadCount = ref(0)

const activeMenu = computed(() => {
  return route.path
})

function goHome() {
  router.push('/')
}

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

function handleAdminLogout() {
  userStore.adminLogout()
  ElMessage.success('已退出登录')
  router.push('/')
}

async function fetchUnread() {
  if (userStore.isAuthenticated) {
    try {
      const res = await api.get('/notifications/unread-count')
      if (res.data.success) unreadCount.value = res.data.data.count
    } catch (e) {}
  }
}

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchUnread()
  }
})
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
  margin-right: 20px;
}

.logo-container:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  user-select: none;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0; /* 允许 flex 子元素缩小 */
}

.nav-menu-inner {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
}

.nav-item {
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  color: #333;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  user-select: none;
}

.nav-item:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.nav-item.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  border-bottom-color: #667eea;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
}

.notification-btn {
  color: #333;
}

.user-info {
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logo-text {
    font-size: 18px;
    letter-spacing: 1px;
  }
  
  .top-navbar {
    height: 50px;
  }
  
  .navbar-content {
    padding: 0 10px;
  }
  
  .logo-container {
    margin-right: 8px;
    padding: 4px 8px;
  }
  
  .nav-menu {
    flex: 1;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .nav-menu-inner {
    display: flex !important;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
  }
  
  .nav-item {
    padding: 0 12px !important;
    height: 50px;
    line-height: 50px;
    font-size: 13px;
    flex-shrink: 0;
  }
  
  .user-actions {
    margin-left: 8px;
    flex-shrink: 0;
  }
  
  .user-actions .el-button {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .user-info {
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* 确保菜单项在小屏幕上也能正常显示 */
@media (max-width: 480px) {
  .nav-item {
    padding: 0 8px !important;
    font-size: 12px;
  }
  
  .logo-text {
    font-size: 16px;
  }
}
</style>

