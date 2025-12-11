<template>
  <div class="styles-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>样式管理</h3>
          <el-button type="primary" @click="showDialog = true">添加样式</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="信纸样式" name="paper">
          <el-table :data="currentStyles" v-loading="loading" style="width: 100%">
            <el-table-column prop="style_id" label="ID" width="80" />
            <el-table-column prop="style_name" label="名称" width="150" />
            <el-table-column prop="style_value" label="样式值" width="150" />
            <el-table-column label="预览图" width="200">
              <template #default="{ row }">
                <img 
                  v-if="row.preview_url" 
                  :src="getImageUrl(row.preview_url)" 
                  style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px;"
                  @error="handleImageError"
                />
                <span v-else style="color: #909399;">无预览图</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'danger'">
                  {{ row.is_active ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editStyle(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="字体样式" name="font">
          <el-table :data="currentStyles" v-loading="loading" style="width: 100%">
            <el-table-column prop="style_id" label="ID" width="80" />
            <el-table-column prop="style_name" label="名称" width="150" />
            <el-table-column prop="style_value" label="样式值" width="150" />
            <el-table-column label="预览图" width="200">
              <template #default="{ row }">
                <img 
                  v-if="row.preview_url" 
                  :src="getImageUrl(row.preview_url)" 
                  style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px;"
                  @error="handleImageError"
                />
                <span v-else style="color: #909399;">无预览图</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'danger'">
                  {{ row.is_active ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editStyle(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="边框样式" name="border">
          <el-table :data="currentStyles" v-loading="loading" style="width: 100%">
            <el-table-column prop="style_id" label="ID" width="80" />
            <el-table-column prop="style_name" label="名称" width="150" />
            <el-table-column prop="style_value" label="样式值" width="150" />
            <el-table-column label="预览图" width="200">
              <template #default="{ row }">
                <img 
                  v-if="row.preview_url" 
                  :src="getImageUrl(row.preview_url)" 
                  style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px;"
                  @error="handleImageError"
                />
                <span v-else style="color: #909399;">无预览图</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'danger'">
                  {{ row.is_active ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editStyle(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingStyle ? '编辑样式' : '添加样式'"
      width="600px"
    >
      <el-form
        ref="styleFormRef"
        :model="styleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="样式类型" prop="style_type">
          <el-select v-model="styleForm.style_type" :disabled="!!editingStyle" placeholder="选择样式类型">
            <el-option label="信纸样式" value="paper" />
            <el-option label="字体样式" value="font" />
            <el-option label="边框样式" value="border" />
          </el-select>
        </el-form-item>
        <el-form-item label="样式名称" prop="style_name">
          <el-input v-model="styleForm.style_name" placeholder="请输入样式名称" />
        </el-form-item>
        <el-form-item label="样式值" prop="style_value">
          <el-input v-model="styleForm.style_value" placeholder="请输入样式值（用于代码识别，如：classic）" />
        </el-form-item>
        <el-form-item label="预览图片">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              :show-file-list="false"
              accept="image/*"
              name="image"
            >
              <el-button type="primary">上传图片</el-button>
              <template #tip>
                <div class="el-upload__tip">支持 jpg/png/gif/webp 格式，大小不超过5MB</div>
              </template>
            </el-upload>
            <div v-if="styleForm.preview_url" style="margin-top: 8px;">
              <img 
                :src="getImageUrl(styleForm.preview_url)" 
                style="max-width: 300px; max-height: 200px; border-radius: 4px; border: 1px solid #dcdfe6;"
                @error="handleImageError"
              />
              <div style="margin-top: 8px;">
                <el-button type="danger" size="small" @click="styleForm.preview_url = ''">删除图片</el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="styleForm.style_type === 'font'" label="字体文件">
          <div style="display:flex;flex-direction:column;gap:12px;">
            <el-upload
              :action="uploadFontUrl"
              :headers="uploadHeaders"
              :on-success="handleFontUploadSuccess"
              :on-error="handleFontUploadError"
              :before-upload="beforeFontUpload"
              :show-file-list="false"
              accept=".woff,.woff2,.ttf,.otf"
              name="font"
            >
              <el-button type="primary">上传字体文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持 woff/woff2/ttf/otf，大小不超过10MB</div>
              </template>
            </el-upload>

            <div v-if="styleForm.font_url" style="margin-top:8px;">
              <a :href="getImageUrl(styleForm.font_url)" target="_blank">查看已上传字体文件</a>
              <div style="margin-top:8px;"><el-button type="danger" size="small" @click="styleForm.font_url = ''">删除字体文件</el-button></div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveStyle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../../utils/api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const activeTab = ref('paper')
const styles = ref({ paper: [], font: [], border: [] })
const loading = ref(false)
const showDialog = ref(false)
const editingStyle = ref(null)
const saving = ref(false)
const styleFormRef = ref(null)

const styleForm = reactive({
  style_type: 'paper',
  style_name: '',
  style_value: '',
  preview_url: '',
  font_url: ''
})

const rules = {
  style_type: [{ required: true, message: '请选择样式类型', trigger: 'change' }],
  style_name: [{ required: true, message: '请输入样式名称', trigger: 'blur' }],
  style_value: [{ required: true, message: '请输入样式值', trigger: 'blur' }]
}

const currentStyles = computed(() => {
  return styles.value[activeTab.value] || []
})

const uploadUrl = computed(() => {
  // 使用相对路径，axios会自动处理
  return '/api/upload/style-image'
})

const uploadFontUrl = computed(() => {
  return '/api/upload/font-file'
})

const uploadHeaders = computed(() => {
  const token = userStore.token || localStorage.getItem('adminToken')
  return {
    'Authorization': `Bearer ${token}`
  }
})

function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 相对路径，添加API基础URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function handleImageError(event) {
  event.target.style.display = 'none'
}

function handleTabChange(tabName) {
  fetchStyles()
}

async function fetchStyles() {
  loading.value = true
  try {
    const response = await api.get(`/styles?type=${activeTab.value}`)
    if (response.data.success) {
      styles.value[activeTab.value] = response.data.data || []
    }
  } catch (error) {
    ElMessage.error('获取样式列表失败')
  } finally {
    loading.value = false
  }
}

function editStyle(style) {
  editingStyle.value = style
  styleForm.style_type = style.style_type
  styleForm.style_name = style.style_name
  styleForm.style_value = style.style_value
  styleForm.preview_url = style.preview_url || ''
  styleForm.font_url = style.font_url || ''
  showDialog.value = true
}

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }
  return true
}

function beforeFontUpload(file) {
  const allowed = ['font/woff', 'font/woff2', 'font/otf', 'font/ttf', 'application/font-woff', 'application/font-woff2']
  const ext = file.name.split('.').pop().toLowerCase()
  const allowedExt = ['woff', 'woff2', 'ttf', 'otf']
  const isAllowedExt = allowedExt.includes(ext)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isAllowedExt) {
    ElMessage.error('只允许上传字体文件（woff, woff2, ttf, otf）')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('字体大小不能超过10MB！')
    return false
  }
  return true
}

function handleUploadSuccess(response) {
  if (response.success) {
    styleForm.preview_url = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

function handleUploadError(error) {
  ElMessage.error('图片上传失败：' + (error.message || '未知错误'))
}

function handleFontUploadSuccess(response) {
  if (response.success) {
    styleForm.font_url = response.data.url
    ElMessage.success('字体上传成功')
  } else {
    ElMessage.error(response.message || '字体上传失败')
  }
}

function handleFontUploadError(error) {
  ElMessage.error('字体上传失败：' + (error.message || '未知错误'))
}

async function saveStyle() {
  if (!styleFormRef.value) return
  
  await styleFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (editingStyle.value) {
          // 更新
          const response = await api.put(`/admin/styles/${editingStyle.value.style_id}`, styleForm)
          if (response.data.success) {
            ElMessage.success('更新成功')
            showDialog.value = false
            resetForm()
            fetchStyles()
          }
        } else {
          // 创建
          const response = await api.post('/admin/styles', styleForm)
          if (response.data.success) {
            ElMessage.success('创建成功')
            showDialog.value = false
            resetForm()
            fetchStyles()
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
  editingStyle.value = null
  styleForm.style_type = 'paper'
  styleForm.style_name = ''
  styleForm.style_value = ''
  styleForm.preview_url = ''
  styleForm.font_url = ''
  styleFormRef.value?.resetFields()
}

onMounted(() => {
  fetchStyles()
})
</script>

<style scoped>
.styles-page {
  padding: 20px;
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

