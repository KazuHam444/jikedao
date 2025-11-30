<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.label">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const statistics = ref([
  { label: '用户总数', value: 0 },
  { label: '信件总数', value: 0 },
  { label: '回信总数', value: 0 },
  { label: '精选信件', value: 0 }
])

async function fetchStatistics() {
  try {
    const response = await api.get('/admin/statistics')
    if (response.data.success) {
      const data = response.data.data
      statistics.value = [
        { label: '用户总数', value: data.users },
        { label: '信件总数', value: data.letters },
        { label: '回信总数', value: data.replies },
        { label: '精选信件', value: data.featured_letters }
      ]
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.dashboard {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>

