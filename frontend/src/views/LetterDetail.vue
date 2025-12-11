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
              <LetterDisplay
                :title="letter.title"
                :content="letter.content"
                :paperStyle="letter.paper_style"
                :fontStyle="letter.font_style"
                :borderStyle="letter.border_style"
                :figureName="letter.figure_name"
              />
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

            <!-- 评论区 -->
            <el-card class="comment-card">
              <template #header>
                <div class="card-header">
                  <h3>评论</h3>
                </div>
              </template>

              <div class="comment-list">
                <div v-if="comments.length === 0">
                  <el-empty description="还没有评论，写下你的想法吧" />
                </div>
                <div v-else>
                  <div class="comment-item" v-for="c in comments" :key="c.comment_id">
                    <div class="comment-meta">
                      <strong class="comment-author">{{ c.username }}</strong>
                      <span class="comment-date">{{ formatDate(c.created_at) }}</span>
                    </div>
                    <div class="comment-body" v-html="formatContent(c.content)"></div>
                  </div>
                </div>
              </div>

              <div style="margin-top:16px;">
                <el-input type="textarea" v-model="commentContent" placeholder="写下评论..." :rows="3" />
                <div style="margin-top:8px;text-align:right;">
                  <el-button type="primary" :loading="postingComment" @click="postComment">发表评论</el-button>
                </div>
              </div>
            </el-card>
          
          <el-empty v-if="!loading && letter && isOwner && letter.status === 'sent'" description="还没有收到回信，点击上方按钮生成回信" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import api from '../utils/api'
import LetterDisplay from '../components/LetterDisplay.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const letter = ref(null)
const reply = ref(null)
const loading = ref(false)
const generatingReply = ref(false)
  const comments = ref([])
  const commentContent = ref('')
  const postingComment = ref(false)

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
      // 调试：输出样式值
      console.log('信件样式值:', {
        paper_style: letter.value.paper_style,
        font_style: letter.value.font_style,
        border_style: letter.value.border_style
      })
      fetchComments()
    }
  } catch (error) {
    ElMessage.error('获取信件详情失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

  // 获取评论
  async function fetchComments() {
    try {
      const res = await api.get(`/comments/letter/${route.params.id}`)
      if (res.data.success) comments.value = res.data.data
    } catch (e) {
      // ignore
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

  async function postComment() {
    if (!commentContent.value || commentContent.value.trim().length === 0) return
    postingComment.value = true
    try {
      const res = await api.post('/comments', { letter_id: route.params.id, content: commentContent.value })
      if (res.data.success) {
        commentContent.value = ''
        fetchComments()
        ElMessage.success('评论已发布')
      }
    } catch (e) {
      ElMessage.error('发布评论失败')
    } finally {
      postingComment.value = false
    }
  }

onMounted(() => {
  fetchLetterDetail()
})
</script>

<style scoped>
.letter-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* 信件详情页面背景 - 阅读和古典场景 */
  background-image: url('https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.letter-detail-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.85) 0%, rgba(195, 207, 226, 0.85) 100%);
  z-index: 0;
}

.letter-detail-page > * {
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

.header-content h2 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.el-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-main {
  max-width: 1000px;
  margin: 30px auto;
}

.letter-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.letter-card,
.reply-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.letter-card:hover,
.reply-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
}

.card-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
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
  padding: 24px;
}

.content-text {
  line-height: 2;
  font-size: 16px;
  color: #333;
  white-space: pre-wrap;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.comment-item {
  padding: 12px 20px;
  border-bottom: 1px dashed rgba(200,200,200,0.3);
}
.comment-meta {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:8px;
}
.comment-author { color:#333 }
.comment-date { color:#909399; font-size:12px }
.comment-body { color:#333; white-space:pre-wrap }

.letter-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(228, 231, 237, 0.5);
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>

