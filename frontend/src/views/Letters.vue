<template>
  <div class="letters-page">
    <el-container>
      <el-main>
        <div class="page-header">
          <div class="page-header-left">
            <img :src="letterClose" class="header-icon" alt="信件图标" />
            <h2>我的信件</h2>
          </div>
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

const letterClose = '/letter_close1.png'

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
  /* 使用专用背景 background2.png */
  background-image: url('/background2.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

/* 已移除覆盖遮罩，页面直接显示 background2.png */

.letters-page > * {
  position: relative;
  z-index: 1;
}

/* 导航栏已移至全局组件，删除原有样式 */

.el-main {
  /* 半透明卡片：保留模糊、轻阴影与细边框，但不实心 */
  background: rgba(255, 255, 255, 0.546);
  backdrop-filter: blur(2px);
  margin: 20px;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

:deep(.el-table) {
  /* 表格完全透明，无对比 */
  background: transparent;
  backdrop-filter: none;
}

:deep(.el-table th) {
  background: transparent;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* page header icon */
.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.page-header-left { display:flex; align-items:center; gap:12px; }
.page-header .header-icon { width:48px; height:48px; object-fit:contain; }
.page-header h2 { margin:0; font-size:20px; }
</style>

