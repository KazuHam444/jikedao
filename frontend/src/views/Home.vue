<template>
  <div class="home">
    <el-container>
      <!-- 头部导航 -->
      <el-header>
        <div class="header-content">
          <div class="logo">
            <h1>跨时空邮局</h1>
          </div>
          <div class="nav">
            <el-menu
              mode="horizontal"
              :default-active="activeMenu"
              router
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
          <div class="user-actions">
            <template v-if="userStore.isAuthenticated">
              <el-button type="text" @click="$router.push('/notifications')" style="margin-right:12px;">
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
              <el-button type="primary" @click="$router.push('/login')">登录</el-button>
              <el-button @click="$router.push('/register')">注册</el-button>
              <el-button type="info" @click="$router.push('/admin/login')">管理员</el-button>
            </template>
          </div>
        </div>
      </el-header>

      <!-- 主要内容 -->
      <el-main>
        <div class="banner">
          <h2>跨越时空，与历史对话</h2>
          <p>给历史人物写信，收到来自过去的回信</p>
          <el-button v-if="!userStore.isAuthenticated" type="primary" size="large" @click="$router.push('/register')">
            开始写信
          </el-button>
          <el-button v-else type="primary" size="large" @click="$router.push('/write')">
            开始写信
          </el-button>
        </div>

        <!-- 精选信件展示 -->
        <div class="featured-letters">
          <h3>精选信件</h3>
          <el-row :gutter="20" v-loading="loading">
            <el-col
              v-for="letter in letters"
              :key="letter.letter_id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card
                class="letter-card"
                shadow="hover"
                @click="viewLetter(letter.letter_id)"
              >
                <template #header>
                  <div class="card-header">
                    <span>{{ letter.title }}</span>
                  </div>
                </template>
                <div class="letter-info">
                  <p class="author">作者：{{ letter.username }}</p>
                  <p class="figure">致：{{ letter.figure_name }}（{{ letter.era }}）</p>
                  <p class="date">{{ formatDate(letter.writing_date) }}</p>
                  <div style="position:absolute;right:12px;top:8px;">
                    <LikeButton :letterId="letter.letter_id" :initialCount="letter.like_count || 0" @toggled="onToggled" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-empty v-if="!loading && letters.length === 0" description="暂无精选信件" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import api from '@/utils/api'
import LikeButton from '@/components/LikeButton.vue'
import { Bell } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const letters = ref([])
const loading = ref(false)

const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

const unreadCount = ref(0)

async function fetchUnread() {
  try {
    const res = await api.get('/notifications/unread-count')
    if (res.data.success) unreadCount.value = res.data.data.count
  } catch (e) {}
}

// 获取精选信件
async function fetchFeaturedLetters() {
  loading.value = true
  try {
    const response = await api.get('/letters/public', {
      params: { page: 1, limit: 8 }
    })
    if (response.data.success) {
      letters.value = response.data.data.letters
    }
  } catch (error) {
    ElMessage.error('获取信件列表失败')
  } finally {
    loading.value = false
  }
}

// 查看信件详情
function viewLetter(letterId) {
  router.push({ name: 'letter-detail', params: { id: letterId } })
}

function onToggled(payload){
  // 可在这里处理切换后逻辑（例如刷新计数）
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 退出登录
function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

onMounted(()=>{ if(userStore.isAuthenticated) fetchUnread() })

onMounted(() => {
  fetchFeaturedLetters()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* 首页背景 - 历史人物和古代建筑主题 */
  background-image: url('https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
  z-index: 0;
}

.home > * {
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo h1 {
  color: #fff;
  margin: 0;
  font-size: 24px;
}

.nav {
  flex: 1;
  margin: 0 40px;
}

.nav :deep(.el-menu) {
  background: transparent;
  border: none;
}

.nav :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.9);
}

.nav :deep(.el-menu-item:hover),
.nav :deep(.el-menu-item.is-active) {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.banner {
  text-align: center;
  color: #fff;
  padding: 80px 0;
  animation: fadeIn 0.8s ease-out;
}

.banner h2 {
  font-size: 52px;
  margin-bottom: 24px;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.banner p {
  font-size: 22px;
  margin-bottom: 40px;
  opacity: 0.95;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.featured-letters {
  margin-top: 40px;
}

.featured-letters h3 {
  color: #fff;
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
}

.letter-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
}

.letter-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.letter-info {
  font-size: 14px;
  color: #666;
}

.letter-info p {
  margin: 8px 0;
}

.author {
  color: #409eff;
}

.figure {
  color: #67c23a;
}

.date {
  color: #909399;
  font-size: 12px;
}
</style>

