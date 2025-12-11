<template>
  <div class="replies-page">
    <el-container>
      <el-main>
        <div class="page-header">
          <h2>回信管理</h2>
        </div>
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>我的信件</div>
              <div>
                <el-button type="primary" @click="batchGenerate" :loading="batchLoading">批量生成回信</el-button>
              </div>
            </div>
          </template>

          <el-table :data="letters" style="width:100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="title" label="标题"/>
            <el-table-column prop="figure_name" label="致"/>
            <el-table-column prop="writing_date" label="写于" :formatter="formatDate"/>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag type="success" v-if="row.has_reply">已回信</el-tag>
                <el-tag type="info" v-else>未回信</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button size="small" @click="viewLetter(row.letter_id)">查看</el-button>
                <el-button size="small" type="primary" @click="generate(row.letter_id)" :loading="loadingMap[row.letter_id]">生成回信</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../utils/api'

const router = useRouter()
const letters = ref([])
const selected = ref([])
const batchLoading = ref(false)
const loadingMap = ref({})

async function fetchLetters() {
  try {
    const res = await api.get('/letters/my-letters', { params: { page: 1, limit: 100 } })
    if (res.data.success) letters.value = res.data.data.letters
  } catch (err) {
    ElMessage.error('获取我的信件失败')
  }
}

function viewLetter(id){
  router.push({ name: 'letter-detail', params: { id } })
}

async function generate(letterId){
  try{
    loadingMap.value[letterId] = true
    const res = await api.post(`/replies/generate/${letterId}`)
    if(res.data.success){
      ElMessage.success('回信生成成功')
      fetchLetters()
    }
  }catch(err){
    ElMessage.error('生成回信失败')
  }finally{
    loadingMap.value[letterId] = false
  }
}

async function batchGenerate(){
  if(selected.value.length === 0){
    ElMessage.info('请先选择信件')
    return
  }
  batchLoading.value = true
  for(const row of selected.value){
    try{
      await api.post(`/replies/generate/${row.letter_id}`)
    }catch(e){
      // ignore individual errors
    }
  }
  batchLoading.value = false
  ElMessage.success('批量生成任务已提交')
  fetchLetters()
}

function formatDate(row, column, cellValue){
  if(!cellValue) return ''
  return new Date(cellValue).toLocaleString()
}

onMounted(()=>{
  fetchLetters()
})
</script>

<style scoped>
.replies-page { min-height: 100vh; }

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
