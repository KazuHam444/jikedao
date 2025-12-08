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
            <el-button type="info" @click="openPreview" style="margin-top: 8px;">预览信纸</el-button>
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
        <el-dialog :visible.sync="previewVisible" title="信件预览" width="820px">
          <LetterPreview
            :title="writeForm.title"
            :content="writeForm.content"
            :paper="currentPaper"
            :font="currentFont"
            :border="currentBorder"
            :figureName="(figures.find(f=>f.figure_id===writeForm.figure_id)||{}).name || ''"
          />
          <template #footer>
            <el-button @click="previewVisible = false">关闭</el-button>
            <el-button type="primary" @click="() => handleSubmit()">确认并发送</el-button>
            <el-button type="success" @click="() => handleSubmit(true)" style="margin-left:8px;">确认并发送并返回首页</el-button>
          </template>
        </el-dialog>

        <!-- 发送成功页面改为独立路由 /send-success/:id -->

      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../utils/api'
import LetterPreview from '../components/LetterPreview.vue'

const router = useRouter()

const writeFormRef = ref(null)
const loading = ref(false)

const figures = ref([])
const paperStyles = ref([])
const fontStyles = ref([])
const borderStyles = ref([])
    const previewVisible = ref(false)
    const currentPaper = ref(null)
    const currentFont = ref(null)
    const currentBorder = ref(null)

    // 打开预览并设置当前样式
    function openPreview() {
      currentPaper.value = paperStyles.value.find(p => p.style_value === writeForm.paper_style) || null
      currentFont.value = fontStyles.value.find(f => f.style_value === writeForm.font_style) || null
      currentBorder.value = borderStyles.value.find(b => b.style_value === writeForm.border_style) || null
      previewVisible.value = true
    }

const writeForm = reactive({
  figure_id: null,
  title: '',
  content: '',
  paper_style: 'default',
  font_style: 'default',
  border_style: 'default',
  is_public: false
})

// 成功页不再使用内嵌对话，发送成功后跳转到独立页面

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
async function handleSubmit(returnHome = false) {
  if (!writeFormRef.value) return

  await writeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await api.post('/letters', writeForm)
        if (response.data.success) {
          ElMessage.success('信件发送成功！')
          const letterId = response.data.data.letter_id
          // 跳转到发送成功页面，用户在该页选择后续操作
          router.push({ name: 'send-success', params: { id: letterId } })
        }
      } catch (error) {
        ElMessage.error('发送失败')
      } finally {
        loading.value = false
        previewVisible.value = false
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
/* 简单的成功动画样式 */
.success-wrap{display:flex;flex-direction:column;align-items:center;padding:24px}
.checkmark{
  width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#67d28d,#2fb05b);box-shadow:0 6px 18px rgba(47,176,91,0.24);margin-bottom:12px;animation:pop .36s ease-out;
}
.checkmark svg{width:44px;height:44px;fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
@keyframes pop{0%{transform:scale(.6)}80%{transform:scale(1.05)}100%{transform:scale(1)}}
</style>

<style scoped>
.write-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* 写信页面背景 - 古典书房和书写场景 */
  background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.write-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.85) 0%, rgba(195, 207, 226, 0.85) 100%);
  z-index: 0;
}

.write-page > * {
  position: relative;
  z-index: 1;
}

.el-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-header h2 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.el-main {
  max-width: 900px;
  margin: 30px auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-button--primary) {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>

