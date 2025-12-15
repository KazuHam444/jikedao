<template>
  <div class="featured-letters-page">
    <el-container>
      <el-main>
        <div class="page-header">
          <h2>精选信件</h2>
          <p class="subtitle">跨越时空的精彩对话</p>
        </div>

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
        
        <el-pagination
          v-if="pagination.total > 0"
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchFeaturedLetters"
          @current-change="fetchFeaturedLetters"
          style="margin-top: 30px; justify-content: center;"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../utils/api'
import LikeButton from '../components/LikeButton.vue'

const router = useRouter()

const letters = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 获取精选信件
async function fetchFeaturedLetters() {
  loading.value = true
  try {
    const response = await api.get('/letters/public', {
      params: {
        page: pagination.page,
        limit: pagination.limit
      }
    })
    if (response.data.success) {
      letters.value = response.data.data.letters
      pagination.total = response.data.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('获取精选信件失败')
  } finally {
    loading.value = false
  }
}

// 查看信件详情
function viewLetter(letterId) {
  router.push({ name: 'letter-detail', params: { id: letterId } })
}

function onToggled(payload) {
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
.featured-letters-page {
  min-height: 100vh;
  /* 使用全局 CSS 变量 --bg-login（指向 /background.jpg）作为背景 */
  background-image: var(--bg-login);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.featured-letters-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 0;
}

.featured-letters-page > * {
  position: relative;
  z-index: 1;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: #fff;
}

.page-header h2 {
  font-size: 36px;
  margin-bottom: 12px;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.subtitle {
  font-size: 18px;
  opacity: 0.95;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
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
  position: relative;
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

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
}
</style>

