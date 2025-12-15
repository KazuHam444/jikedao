<template>
  <div class="letters-page">
    <el-container>
      <el-main>
        <div class="page-header">
          <h2>我的信件</h2>
          <el-button type="primary" @click="$router.push('/write')">
            <el-icon><Edit /></el-icon>
            写新信
          </el-button>
        </div>
        <el-table
          :data="letters"
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column prop="title" label="标题" width="200" />
          <el-table-column prop="figure_name" label="收信人" width="150" />
          <el-table-column prop="era" label="时代" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="公开" width="80">
            <template #default="{ row }">
              <el-tag :type="row.is_public ? 'success' : 'info'">
                {{ row.is_public ? '公开' : '私密' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="writing_date" label="写信时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.writing_date) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="viewLetter(row.letter_id)"
              >
                查看
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteLetter(row.letter_id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="!loading && letters.length === 0" description="还没有写过信，去写一封吧！" />
        
        <el-pagination
          v-if="pagination.total > 0"
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchLetters"
          @current-change="fetchLetters"
          style="margin-top: 20px; justify-content: center;"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import api from '../utils/api'

const router = useRouter()

const letters = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 获取信件列表
async function fetchLetters() {
  loading.value = true
  try {
    const response = await api.get('/letters/my-letters', {
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
    ElMessage.error('获取信件列表失败')
  } finally {
    loading.value = false
  }
}

// 查看信件
function viewLetter(letterId) {
  router.push({ name: 'letter-detail', params: { id: letterId } })
}

// 删除信件
async function deleteLetter(letterId) {
  try {
    await ElMessageBox.confirm('确定要删除这封信吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await api.delete(`/letters/${letterId}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchLetters()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 获取状态类型
function getStatusType(status) {
  const map = {
    draft: 'info',
    sent: 'warning',
    replied: 'success'
  }
  return map[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const map = {
    draft: '草稿',
    sent: '已发送',
    replied: '已回复'
  }
  return map[status] || status
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  fetchLetters()
})
</script>

<style scoped>
.letters-page {
  min-height: 100vh;
  /* 使用全局 background.png */
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.letters-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.85) 0%, rgba(195, 207, 226, 0.85) 100%);
  z-index: 0;
}

.letters-page > * {
  position: relative;
  z-index: 1;
}

/* 导航栏已移至全局组件，删除原有样式 */

.el-main {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin: 20px;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.el-table) {
  background: transparent;
}

:deep(.el-table th) {
  background: rgba(245, 247, 250, 0.5);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
</style>

