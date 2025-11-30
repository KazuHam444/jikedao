<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用户管理</h3>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名或邮箱"
            style="width: 300px"
            clearable
            @clear="fetchUsers"
            @keyup.enter="fetchUsers"
          >
            <template #append>
              <el-button @click="fetchUsers">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>
      
      <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="user_id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="letter_count" label="信件数" width="100" />
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              :type="row.is_active ? 'danger' : 'success'"
              size="small"
              @click="toggleUserStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
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
        @size-change="fetchUsers"
        @current-change="fetchUsers"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

const users = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

async function fetchUsers() {
  loading.value = true
  try {
    const response = await api.get('/admin/users', {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        search: searchKeyword.value
      }
    })
    if (response.data.success) {
      users.value = response.data.data.users
      pagination.total = response.data.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

async function toggleUserStatus(user) {
  try {
    await ElMessageBox.confirm(
      `确定要${user.is_active ? '禁用' : '启用'}用户 ${user.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await api.put(`/admin/users/${user.user_id}/status`, {
      is_active: !user.is_active
    })
    if (response.data.success) {
      ElMessage.success('操作成功')
      fetchUsers()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}
</style>

