<template>
  <div class="write-page">
    <el-container>
      <el-header>
        <h2>写信给历史人物</h2>
      </el-header>
      
      <el-main>
        <el-form
          ref="writeFormRef"
          :model="writeForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="选择历史人物" prop="figure_id">
            <el-select
              v-model="writeForm.figure_id"
              placeholder="请选择历史人物"
              style="width: 100%"
              @change="handleFigureChange"
            >
              <el-option
                v-for="figure in figures"
                :key="figure.figure_id"
                :label="`${figure.name}（${figure.era}）`"
                :value="figure.figure_id"
              >
                <div style="display: flex; align-items: center;">
                  <span>{{ figure.name }}</span>
                  <el-tag size="small" style="margin-left: 10px;">{{ figure.era }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="信件标题" prop="title">
            <el-input
              v-model="writeForm.title"
              placeholder="请输入信件标题"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="信件内容" prop="content">
            <el-input
              v-model="writeForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入信件内容..."
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="信纸样式">
            <el-select v-model="writeForm.paper_style" placeholder="选择信纸样式">
              <el-option
                v-for="style in paperStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="字体样式">
            <el-select v-model="writeForm.font_style" placeholder="选择字体样式">
              <el-option
                v-for="style in fontStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="边框样式">
            <el-select v-model="writeForm.border_style" placeholder="选择边框样式">
              <el-option
                v-for="style in borderStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="是否公开">
            <el-switch
              v-model="writeForm.is_public"
              active-text="公开"
              inactive-text="私密"
            />
            <span style="margin-left: 10px; color: #909399; font-size: 12px;">
              公开的信件可以被其他用户看到，并可能被管理员选为精选
            </span>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              发送信件
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const router = useRouter()

const writeFormRef = ref(null)
const loading = ref(false)

const figures = ref([])
const paperStyles = ref([])
const fontStyles = ref([])
const borderStyles = ref([])

const writeForm = reactive({
  figure_id: null,
  title: '',
  content: '',
  paper_style: 'default',
  font_style: 'default',
  border_style: 'default',
  is_public: false
})

const rules = {
  figure_id: [
    { required: true, message: '请选择历史人物', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入信件标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入信件内容', trigger: 'blur' },
    { min: 10, message: '信件内容至少10个字符', trigger: 'blur' }
  ]
}

// 获取历史人物列表
async function fetchFigures() {
  try {
    const response = await api.get('/figures')
    if (response.data.success) {
      figures.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取历史人物列表失败')
  }
}

// 获取样式配置
async function fetchStyles() {
  try {
    const response = await api.get('/styles')
    if (response.data.success) {
      const styles = response.data.data
      paperStyles.value = styles.paper || []
      fontStyles.value = styles.font || []
      borderStyles.value = styles.border || []
    }
  } catch (error) {
    ElMessage.error('获取样式配置失败')
  }
}

// 历史人物改变
function handleFigureChange() {
  const figure = figures.value.find(f => f.figure_id === writeForm.figure_id)
  if (figure && !writeForm.title) {
    writeForm.title = `致${figure.name}的一封信`
  }
}

// 提交表单
async function handleSubmit() {
  if (!writeFormRef.value) return
  
  await writeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await api.post('/letters', writeForm)
        if (response.data.success) {
          ElMessage.success('信件发送成功！')
          const letterId = response.data.data.letter_id
          router.push({ name: 'letter-detail', params: { id: letterId } })
        }
      } catch (error) {
        ElMessage.error('发送失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
function handleReset() {
  writeFormRef.value?.resetFields()
}

onMounted(() => {
  fetchFigures()
  fetchStyles()
})
</script>

<style scoped>
.write-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.el-header h2 {
  margin: 0;
}

.el-main {
  max-width: 800px;
  margin: 20px auto;
  background: #fff;
  padding: 30px;
  border-radius: 4px;
}
</style>

