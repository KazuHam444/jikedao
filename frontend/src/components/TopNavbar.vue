<template>
  <div class="top-navbar">
    <div class="navbar-content">
      <!-- Logo -->
      <div class="logo-container" @click="goHome">
        <span class="logo-text">跨时空邮局</span>
      </div>
      
      <!-- 导航菜单 -->
      <div class="nav-menu">
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          class="nav-menu-inner"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item v-if="userStore.isAuthenticated" index="/letters">
            我的信件
          </el-menu-item>
          <el-menu-item v-if="userStore.isAuthenticated" index="/replies">
            回信
          </el-menu-item>
          <el-menu-item v-if="userStore.isAuthenticated" index="/write">
            写信
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">
            管理后台
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 用户操作 -->
      <div class="user-actions">
        <template v-if="userStore.isAuthenticated">
          <el-button type="text" @click="$router.push('/notifications')" class="notification-btn">
            <el-badge :value="unreadCount" class="item">
              <el-icon><Bell /></el-icon>
            </el-badge>
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
}

.nav-menu-inner {
  background: transparent;
  border: none;
}

.nav-menu-inner :deep(.el-menu-item) {
  color: #333;
  border-bottom: 2px solid transparent;
}

.nav-menu-inner :deep(.el-menu-item:hover),
.nav-menu-inner :deep(.el-menu-item.is-active) {
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
    font-size: 20px;
  }
  
  .top-navbar {
    height: 50px;
  }
  
  .navbar-content {
    padding: 0 15px;
  }
  
  .nav-menu {
    display: none; /* 移动端隐藏菜单，可以通过下拉菜单实现 */
  }
  
  .logo-container {
    margin-right: 10px;
  }
  
  .user-actions {
    margin-left: 10px;
  }
  
  .user-actions .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>

