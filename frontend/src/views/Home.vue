<template>
  <div class="home">
    <el-container>
      <!-- 主要内容 -->
      <el-main>
        <div class="banner">
          <h2>跨越时空，与历史对话</h2>
          <p>给历史人物写信，收到来自过去的回信</p>
          <el-button
            type="text"
            size="large"
            class="start-image-button"
            @click="handleStartClick"
          >
            <img
              :src="currentImage"
              alt="开始写信"
              class="start-image"
              :class="{ open: isOpen }"
            />
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
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import api from '../utils/api'
import LikeButton from '../components/LikeButton.vue'
import { Bell } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const letters = ref([])
const loading = ref(false)

const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

const unreadCount = ref(0)

// 控制开始图片的动画与切换
const isOpen = ref(false)
const isAnimating = ref(false)

const currentImage = computed(() => (isOpen.value ? '/letter_open.png' : '/letter_close.png'))

function handleStartClick() {
  if (isAnimating.value) return
  isAnimating.value = true
  isOpen.value = true
  // 动画短暂延迟后跳转到写信页
  setTimeout(() => {
    router.push('/write')
    // 重置状态，避免长时间保持打开图
    setTimeout(() => {
      isOpen.value = false
      isAnimating.value = false
    }, 300)
  }, 400)
}

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

onMounted(() => {
  fetchFeaturedLetters()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  /* 使用全局 CSS 变量 --bg-login（指向 /background.jpg）作为首页背景 */
  background-image: var(--bg-login);
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
  /* 移除紫色透明遮罩，保留空背景以直接显示图片 */
  background: transparent;
  z-index: 0;
}

.home > * {
  position: relative;
  z-index: 1;
}

/* 导航栏已移至全局组件，删除原有样式 */

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding: 40px 0;
  min-height: 60vh;
  box-sizing: border-box;
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

.start-image-button {
  padding: 0;
  border-radius: 8px;
}

.start-image {
  max-height: 128vh; /* 根据视口自适应，避免造成额外滚动条 */
  width: auto;
  display: block;
  border-radius: 8px;
  object-fit: cover;

}

.start-image.open {
  transform: scale(1.02) translateY(-4px);
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.start-image-button {
  cursor: pointer;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px; /* 轻微下移，仍由弹性布局居中 */
}
@media (max-width: 768px) {
  .start-image {
    height: 220px; /* 移动端限制高度，避免过大 */
  }
  .start-image-button {
      margin-top: 8px; /* 移动端减小间距 */
    }
}
</style>

