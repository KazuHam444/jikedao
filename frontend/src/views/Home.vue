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

const router = useRouter()
const userStore = useUserStore()

const letters = ref([])
const loading = ref(false)

const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

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

onMounted(() => {
  fetchFeaturedLetters()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  padding: 60px 0;
}

.banner h2 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: 700;
}

.banner p {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
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
  transition: transform 0.3s;
}

.letter-card:hover {
  transform: translateY(-5px);
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

