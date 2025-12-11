<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin">
          <el-icon><DataBoard /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/letters">
          <el-icon><Document /></el-icon>
          <span>信件管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/figures">
          <el-icon><Avatar /></el-icon>
          <span>历史人物</span>
        </el-menu-item>
        <el-menu-item index="/admin/styles">
          <el-icon><Picture /></el-icon>
          <span>样式管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>管理后台</h2>
          <el-button @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import { DataBoard, User, Document, Avatar, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

function handleLogout() {
  userStore.adminLogout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* 管理员后台背景 - 简洁的办公场景 */
  background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.admin-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.9) 0%, rgba(195, 207, 226, 0.9) 100%);
  z-index: 0;
}

.admin-layout > * {
  position: relative;
  z-index: 1;
}

.admin-menu {
  height: 100vh;
  border-right: 1px solid rgba(228, 231, 237, 0.5);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.el-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-content h2 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.el-main {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>

