<template>
  <div class="admin-letters-page">
    <el-card>
      <template #header>
        <h3>信件管理</h3>
      </template>
      
      <el-table
        :data="letters"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="letter_id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="username" label="作者" width="120" />
        <el-table-column prop="figure_name" label="收信人" width="120" />
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
        <el-table-column label="精选" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_featured ? 'success' : 'info'">
              {{ row.is_featured ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="writing_date" label="写信时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.writing_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.is_featured ? 'info' : 'success'"
              size="small"
              @click="toggleFeatured(row)"
              :disabled="!row.is_public"
            >
              {{ row.is_featured ? '取消精选' : '设为精选' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchLetters"
        @current-change="fetchLetters"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const letters = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

async function fetchLetters() {
  loading.value = true
  try {
    const response = await api.get('/admin/letters', {
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

async function toggleFeatured(letter) {
  try {
    const response = await api.put(`/admin/letters/${letter.letter_id}/feature`, {
      is_featured: !letter.is_featured
    })
    if (response.data.success) {
      ElMessage.success('操作成功')
      fetchLetters()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

function getStatusType(status) {
  const map = {
    draft: 'info',
    sent: 'warning',
    replied: 'success'
  }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = {
    draft: '草稿',
    sent: '已发送',
    replied: '已回复'
  }
  return map[status] || status
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchLetters()
})
</script>

<style scoped>
.admin-letters-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>

