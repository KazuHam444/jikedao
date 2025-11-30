<template>
  <div class="letter-detail-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <el-button @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2>信件详情</h2>
        </div>
      </el-header>
      
      <el-main v-loading="loading">
        <div v-if="letter" class="letter-container">
          <!-- 信件信息 -->
          <el-card class="letter-card">
            <template #header>
              <div class="card-header">
                <h3>{{ letter.title }}</h3>
                <div class="letter-meta">
                  <el-tag>{{ letter.figure_name }}（{{ letter.era }}）</el-tag>
                  <el-tag :type="letter.is_public ? 'success' : 'info'">
                    {{ letter.is_public ? '公开' : '私密' }}
                  </el-tag>
                  <span class="date">{{ formatDate(letter.writing_date) }}</span>
                </div>
              </div>
            </template>
            
            <div class="letter-content">
              <div class="content-text" v-html="formatContent(letter.content)"></div>
            </div>
            
            <div class="letter-actions" v-if="isOwner">
              <el-button type="primary" @click="generateReply" :loading="generatingReply">
                生成回信
              </el-button>
            </div>
          </el-card>
          
          <!-- 回信 -->
          <el-card v-if="reply" class="reply-card">
            <template #header>
              <div class="card-header">
                <h3>回信</h3>
                <span class="date">{{ formatDate(reply.reply_date) }}</span>
              </div>
            </template>
            
            <div class="reply-content">
              <div class="content-text" v-html="formatContent(reply.content)"></div>
            </div>
          </el-card>
          
          <el-empty v-else-if="!loading && letter && isOwner && letter.status === 'sent'" description="还没有收到回信，点击上方按钮生成回信" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const letter = ref(null)
const reply = ref(null)
const loading = ref(false)
const generatingReply = ref(false)

const isOwner = computed(() => {
  return letter.value && userStore.user && letter.value.user_id === userStore.user.user_id
})

// 获取信件详情
async function fetchLetterDetail() {
  loading.value = true
  try {
    const response = await api.get(`/letters/${route.params.id}`)
    if (response.data.success) {
      letter.value = response.data.data.letter
      reply.value = response.data.data.reply
    }
  } catch (error) {
    ElMessage.error('获取信件详情失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 生成回信
async function generateReply() {
  if (!letter.value) return
  
  generatingReply.value = true
  try {
    const response = await api.post(`/replies/generate/${letter.value.letter_id}`)
    if (response.data.success) {
      ElMessage.success('回信生成成功！')
      reply.value = {
        content: response.data.data.content,
        reply_date: new Date().toISOString()
      }
      letter.value.status = 'replied'
    }
  } catch (error) {
    ElMessage.error('生成回信失败')
  } finally {
    generatingReply.value = false
  }
}

// 格式化内容（保留换行）
function formatContent(content) {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchLetterDetail()
})
</script>

<style scoped>
.letter-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

.header-content h2 {
  margin: 0;
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.el-main {
  max-width: 900px;
  margin: 20px auto;
}

.letter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.letter-card,
.reply-card {
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
}

.letter-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date {
  color: #909399;
  font-size: 14px;
}

.letter-content,
.reply-content {
  padding: 20px 0;
}

.content-text {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
  white-space: pre-wrap;
}

.letter-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>

