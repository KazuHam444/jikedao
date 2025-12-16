<template>
  <div class="write-page">
    <el-container>
      // 防止重复提交
      if (loading.value) return

      try {
        // 使用 await 风格的验证，避免回调嵌套导致的竞态
        await writeFormRef.value.validate()
      } catch (err) {
        return
      }

      loading.value = true
      // 生成本次提交 id（可用于跟踪/忽略延迟响应）
      const submitId = Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      submitCompleted.value = false

      try {
        const response = await api.post('/letters', writeForm, { headers: { 'X-Request-Id': submitId } })
        // 仅在尚未标记为完成时处理响应
        if (!submitCompleted.value) {
          if (response.data.success) {
            submitCompleted.value = true
            // 填充已发送信件数据并显示发送后预览对话（保留查看详情按钮）
            const letterId = response.data.data.letter_id
            sentLetter.letter_id = letterId
            sentLetter.title = writeForm.title
            sentLetter.content = writeForm.content
            sentLetter.paper = currentPaper.value
            sentLetter.font = currentFont.value
            sentLetter.border = currentBorder.value
            sentLetter.figureName = (figures.value.find(f => f.figure_id === writeForm.figure_id) || {}).name || ''
            sentPreviewVisible.value = true
          } else {
            ElMessage.error(response.data.message || '发送失败')
          }
        }
      } catch (error) {
        // 如果已在其他请求中成功完成，则忽略后续错误提示
        if (submitCompleted.value) {
          return
        }

        if (error && error.response && error.response.status === 409) {
          ElMessage.warning(error.response.data?.message || '请勿重复提交')
        } else {
          ElMessage.error('发送失败')
        }
      } finally {
        loading.value = false
        previewVisible.value = false
      }
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
              class="board-editor"
              v-model="writeForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入信件内容..."
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="信纸样式">
            <el-select v-model="writeForm.paper_style" placeholder="选择信纸样式" style="width: 100%">
              <el-option
                v-for="style in paperStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img 
                    v-if="style.preview_url" 
                    :src="getImageUrl(style.preview_url)" 
                    style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #dcdfe6;"
                    @error="handleImageError"
                  />
                  <span>{{ style.style_name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="字体样式">
            <el-select v-model="writeForm.font_style" placeholder="选择字体样式" style="width: 100%">
              <el-option
                v-for="style in fontStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img 
                    v-if="style.preview_url" 
                    :src="getImageUrl(style.preview_url)" 
                    style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #dcdfe6;"
                    @error="handleImageError"
                  />
                  <span>{{ style.style_name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="边框样式">
            <el-select v-model="writeForm.border_style" placeholder="选择边框样式" style="width: 100%">
              <el-option
                v-for="style in borderStyles"
                :key="style.style_id"
                :label="style.style_name"
                :value="style.style_value"
              >
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img 
                    v-if="style.preview_url" 
                    :src="getImageUrl(style.preview_url)" 
                    style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #dcdfe6;"
                    @error="handleImageError"
                  />
                  <span>{{ style.style_name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="字体颜色">
            <div style="display: flex; align-items: center; gap: 12px;">
              <el-color-picker v-model="writeForm.font_color" />
              <span>{{ writeForm.font_color }}</span>
            </div>
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
        <el-dialog v-model="previewVisible" title="信件预览" width="900px" :close-on-click-modal="false">
          <div v-if="!writeForm.title && !writeForm.content" style="text-align: center; padding: 40px; color: #909399;">
            请先填写信件标题和内容
          </div>
          <LetterPreview
            v-else
            :title="writeForm.title"
            :content="writeForm.content"
            :paper="currentPaper"
            :font="currentFont"
            :border="currentBorder"
            :figureName="(figures.find(f=>f.figure_id===writeForm.figure_id)||{}).name || ''"
            :fontColor="writeForm.font_color"
          />
          <template #footer>
            <el-button @click="previewVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading" :disabled="loading || !writeForm.title || !writeForm.content">
              确认并发送
            </el-button>
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
const submitCompleted = ref(false)

const figures = ref([])
const filteredFigures = ref([])
const paperStyles = ref([])
const fontStyles = ref([])
const borderStyles = ref([])
    const previewVisible = ref(false)
    const currentPaper = ref(null)
    const currentFont = ref(null)
    const currentBorder = ref(null)

    // 打开预览并设置当前样式
    function openPreview() {
      if (!writeForm.title || !writeForm.content) {
        ElMessage.warning('请先填写信件标题和内容')
        return
      }
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
  font_color: '#333333',
  is_public: false
})

// 成功页不再使用内嵌对话，发送成功后跳转到独立页面

const rules = {
  figure_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
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

// 获取角色列表
async function fetchFigures() {
  try {
    const response = await api.get('/figures')
    if (response.data.success) {
      figures.value = response.data.data
      filteredFigures.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

// 下拉框显示/隐藏时重置过滤
function handleSelectVisible(visible) {
  if (visible) {
    // 打开下拉框时，确保显示所有人物
    filteredFigures.value = figures.value
  }
}

// 搜索过滤角色（支持中英文）
function filterFigures(query) {
  if (!query || query.trim() === '') {
    // 没有搜索词时，显示所有人物
    filteredFigures.value = figures.value
    return
  }
  
  const lowerQuery = query.toLowerCase().trim()
  filteredFigures.value = figures.value.filter(figure => {
    // 搜索姓名（中文）
    if (figure.name.includes(query)) return true
    // 搜索时代（中文）
    if (figure.era.includes(query)) return true
    // 搜索姓名（英文，转小写）
    if (figure.name.toLowerCase().includes(lowerQuery)) return true
    // 搜索时代（英文，转小写）
    if (figure.era.toLowerCase().includes(lowerQuery)) return true
    // 搜索简介（中英文）
    if (figure.biography) {
      if (figure.biography.includes(query) || figure.biography.toLowerCase().includes(lowerQuery)) {
        return true
      }
    }
    return false
  })
}

// 获取图片URL
function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function handleImageError(event) {
  event.target.style.display = 'none'
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
  // 防止重复提交
  if (loading.value) return

<<<<<<< Updated upstream
  await writeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await api.post('/letters', writeForm)
        if (response.data.success) {
          ElMessage.success('信件发送成功！')
          const letterId = response.data.data.letter_id
          // 跳转到信件详情页面
          router.push({ name: 'letter-detail', params: { id: letterId } })
        }
      } catch (error) {
        ElMessage.error('发送失败')
      } finally {
        loading.value = false
        previewVisible.value = false
=======
  try {
    // 使用 await 风格的验证，避免回调嵌套导致的并发问题
    await writeFormRef.value.validate()
  } catch (err) {
    return
  }

  loading.value = true
  // 生成本次提交 id（可用于跟踪/忽略延迟响应）
  const submitId = Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  submitCompleted.value = false

  try {
    const response = await api.post('/letters', writeForm, { headers: { 'X-Request-Id': submitId } })
    // 仅在尚未标记为完成时显示成功提示并导航
    if (!submitCompleted.value) {
      if (response.data.success) {
        submitCompleted.value = true
        ElMessage.success('信件发送成功！')
        const letterId = response.data.data.letter_id
        router.push({ name: 'letter-detail', params: { id: letterId } })
      } else {
        ElMessage.error(response.data.message || '发送失败')
>>>>>>> Stashed changes
      }
    }
  } catch (error) {
    // 如果已在其他请求中成功完成，则忽略后续错误提示
    if (submitCompleted.value) {
      return
    }

    if (error && error.response && error.response.status === 409) {
      ElMessage.warning(error.response.data?.message || '请勿重复提交')
    } else {
      ElMessage.error('发送失败')
    }
  } finally {
    loading.value = false
    previewVisible.value = false
  }
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

@keyframes pop{0%{transform:scale(.6)}80%{transform:scale(1.05)}100%{transform:scale(1)}}
</style>

<style scoped>
.write-page {
  min-height: 100vh;
  /* 全站统一背景 */
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.write-page::before {
  /* 已移除覆盖遮罩以保持信纸的原始色彩 */
  display: none;
}

.write-page > * {
  position: relative;
  z-index: 1;
}

/* 导航栏已移至全局组件，删除原有样式 */

.el-main {
  max-width: 900px;
  margin: 30px auto;
  /* 使用信纸背景并放大以更明显展示纹理 */
  background-image: url('/board.png');
  background-size: 178%; /* 可调整该值控制图片显示大小，100% 为默认覆盖 */
  background-position: center center;
  background-repeat: no-repeat;
  padding: 60px;
  /* 去掉圆角/阴影/边框，移除白框视觉 */
  border-radius: 0;
  box-shadow: none;
  border: none;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

/* 写信编辑框使用 board.png 作为背景（位于 frontend/public/board.png） */
:deep(.board-editor .el-textarea__inner) {
  /* 移除内部背景图效果，仅保留文本样式 */
  background: none;
  background-color: transparent;
  min-height: 200px; /* 保证有足够高度 */
  padding: 4px; /* 增大内边距，让文本不要贴边 */
  color: #222; /* 文本颜色，按需调整 */
}

/* 当用户选择无边框时，透明边框更融合背景 */
:deep(.board-editor .el-textarea__inner:focus) {
  outline: none;
  box-shadow: none;
  border-color: rgba(0,0,0,0.12);
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

