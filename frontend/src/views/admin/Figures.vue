<template>
  <div class="figures-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>历史人物管理</h3>
          <el-button type="primary" @click="showDialog = true">添加历史人物</el-button>
        </div>
      </template>
      
      <el-table
        :data="figures"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="figure_id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="era" label="时代" width="120" />
        <el-table-column prop="biography" label="简介" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editFigure(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingFigure ? '编辑历史人物' : '添加历史人物'"
      width="600px"
    >
      <el-form
        ref="figureFormRef"
        :model="figureForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="figureForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="时代" prop="era">
          <el-input v-model="figureForm.era" placeholder="请输入时代" />
        </el-form-item>
        <el-form-item label="简介" prop="biography">
          <el-input
            v-model="figureForm.biography"
            type="textarea"
            :rows="4"
            placeholder="请输入生平简介"
          />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="figureForm.avatar_url" placeholder="请输入头像URL" />
        </el-form-item>
        <el-form-item label="AI提示词">
          <el-input
            v-model="figureForm.prompt_template"
            type="textarea"
            :rows="3"
            placeholder="请输入AI回信提示词模板"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveFigure">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../../utils/api'

const figures = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingFigure = ref(null)
const saving = ref(false)
const figureFormRef = ref(null)

const figureForm = reactive({
  name: '',
  era: '',
  biography: '',
  avatar_url: '',
  prompt_template: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  era: [{ required: true, message: '请输入时代', trigger: 'blur' }]
}

async function fetchFigures() {
  loading.value = true
  try {
    const response = await api.get('/figures')
    if (response.data.success) {
      figures.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取历史人物列表失败')
  } finally {
    loading.value = false
  }
}

function editFigure(figure) {
  editingFigure.value = figure
  figureForm.name = figure.name
  figureForm.era = figure.era
  figureForm.biography = figure.biography || ''
  figureForm.avatar_url = figure.avatar_url || ''
  figureForm.prompt_template = figure.prompt_template || ''
  showDialog.value = true
}

async function saveFigure() {
  if (!figureFormRef.value) return
  
  await figureFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (editingFigure.value) {
          // 更新
          const response = await api.put(`/admin/figures/${editingFigure.value.figure_id}`, figureForm)
          if (response.data.success) {
            ElMessage.success('更新成功')
            showDialog.value = false
            resetForm()
            fetchFigures()
          }
        } else {
          // 创建
          const response = await api.post('/admin/figures', figureForm)
          if (response.data.success) {
            ElMessage.success('创建成功')
            showDialog.value = false
            resetForm()
            fetchFigures()
          }
        }
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        saving.value = false
      }
    }
  })
}

function resetForm() {
  editingFigure.value = null
  figureForm.name = ''
  figureForm.era = ''
  figureForm.biography = ''
  figureForm.avatar_url = ''
  figureForm.prompt_template = ''
  figureFormRef.value?.resetFields()
}

onMounted(() => {
  fetchFigures()
})
</script>

<style scoped>
.figures-page {
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

