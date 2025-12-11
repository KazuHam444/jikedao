<template>
  <div class="notifications-page">
    <el-container>
      <el-main>
        <div class="page-header">
          <h2>通知</h2>
        </div>
        <div v-if="notifications.length">
          <el-card v-for="n in notifications" :key="n.notification_id" class="mb-12">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div v-html="renderText(n)"></div>
                <div style="color:#999;font-size:12px;margin-top:6px;">{{ formatDate(n.created_at) }}</div>
              </div>
              <div>
                <el-button size="small" @click="markRead([n.notification_id])" v-if="!n.is_read">标记已读</el-button>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无通知" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { ElMessage } from 'element-plus'

const notifications = ref([])

async function fetchNotifications(){
  try{
    const res = await api.get('/notifications')
    if(res.data.success){
      const rows = res.data.data
      // 对于 comment 类型，拉取对应的评论内容以便展示
      await Promise.all(rows.map(async (n) => {
        if (n.type === 'comment') {
          try {
            const data = JSON.parse(n.data || '{}')
            if (data.letter_id && data.comment_id) {
              const r = await api.get(`/comments/letter/${data.letter_id}`)
              if (r.data.success) {
                const found = r.data.data.find(c => c.comment_id === data.comment_id)
                if (found) {
                  n._comment = found
                }
              }
            }
          } catch (err) {
            // ignore per-notification failure
          }
        }
      }))
      notifications.value = rows
    }
  }catch(e){ ElMessage.error('获取通知失败') }
}

function renderText(n){
  try{
    const data = JSON.parse(n.data)
    if(n.type === 'like') return `用户 ${n.actor_user_id} 赞了你的信：《${data.title}》`
    if(n.type === 'comment') {
      const commentText = n._comment ? n._comment.content : '（评论内容已转存，详情请查看）'
      return `用户 ${n.actor_user_id} 在《${data.title}》评论：${commentText}`
    }
    return `${n.type}`
  }catch(e){ return n.type }
}

function formatDate(s){ return new Date(s).toLocaleString() }

async function markRead(ids){
  try{
    await api.post('/notifications/mark-read', { ids })
    ElMessage.success('已标记')
    fetchNotifications()
  }catch(e){ ElMessage.error('操作失败') }
}

onMounted(()=>{ fetchNotifications() })
</script>

<style scoped>
.mb-12{ margin-bottom:12px }

.page-header {
  margin-bottom: 20px;
  padding: 20px 0;
}

.page-header h2 {
  color: #333;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
</style>
