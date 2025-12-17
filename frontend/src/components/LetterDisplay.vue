<template>
  <div class="letter-display">
    <!-- 外层边框容器：使用管理员上传的边框图片 -->
    <div class="border-wrapper" :style="borderStyleComputed">
      <!-- 内层信纸本体：使用信纸样式图片 -->
      <div class="paper" :style="paperStyleComputed">
        <div class="content" :style="fontStyleComputed" v-html="formattedContent"></div>
        <div class="footer" v-if="figureName">
          <div class="signature-text">致：{{ figureName }} · {{ date }}</div>
          <div class="seal-container">
            <div class="seal-paper">
              <img src="/1.png" alt="印章" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import api from '@/utils/api'

const props = defineProps({
  title: String,
  content: String,
  paperStyle: String, // style_value
  fontStyle: String,  // style_value
  borderStyle: String, // style_value
  fontColor: String, // 字体颜色
  figureName: String
})

// 调试：监听props变化
watch(() => [props.paperStyle, props.fontStyle, props.borderStyle], ([paper, font, border]) => {
  console.log('LetterDisplay 接收到的样式值:', { paperStyle: paper, fontStyle: font, borderStyle: border })
}, { immediate: true })

const formattedContent = computed(() => {
  if (!props.content) return ''
  return (`<h3 style="text-align:center;margin-bottom:16px;font-size:20px;">${props.title || ''}</h3>` + props.content.replace(/\n/g, '<br>'))
})

// 获取样式配置
const paperStyles = ref([])
const fontStyles = ref([])
const borderStyles = ref([])

// 边框图片宽高比（用于控制默认展示比例）
const borderAspectRatio = ref(null)

onMounted(async () => {
  try {
    const response = await api.get('/styles')
    if (response.data.success) {
      const styles = response.data.data
      paperStyles.value = styles.paper || []
      fontStyles.value = styles.font || []
      borderStyles.value = styles.border || []
    }
  } catch (error) {
    console.error('获取样式配置失败:', error)
  }
})

// 根据当前选中的边框样式，读取其图片尺寸并计算宽高比
function updateBorderAspectRatio() {
  const border = borderStyles.value.find(b => b.style_value === props.borderStyle)
  if (!border || !border.preview_url) {
    borderAspectRatio.value = null
    return
  }

  let imageUrl = border.preview_url
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  }

  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth && img.naturalHeight) {
      // 按“横板”规则：以长边为水平、短边为垂直，得到 >= 1 的宽高比
      const rawRatio = img.naturalWidth / img.naturalHeight
      borderAspectRatio.value = rawRatio >= 1 ? rawRatio : 1 / rawRatio
    } else {
      borderAspectRatio.value = null
    }
  }
  img.onerror = () => {
    borderAspectRatio.value = null
  }
  img.src = imageUrl
}

// 当边框样式或样式列表变化时，更新宽高比
watch(
  [borderStyles, () => props.borderStyle],
  () => {
    updateBorderAspectRatio()
  },
  { immediate: true }
)

const paperStyleComputed = computed(() => {
  // 先尝试从已加载的样式配置中查找预览图
  const paper = paperStyles.value.find(p => p.style_value === props.paperStyle)
  if (paper && paper.preview_url) {
    // 获取完整的图片URL
    let imageUrl = paper.preview_url
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  
  // 根据style_value直接应用样式（不依赖异步加载）
  const value = props.paperStyle || 'default'
  
  const map = {
    classic: { 
      backgroundColor: '#fff8f0',
      backgroundImage: 'linear-gradient(45deg, #fff8f0 25%, transparent 25%), linear-gradient(-45deg, #fff8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff8f0 75%), linear-gradient(-45deg, transparent 75%, #fff8f0 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    },
    parchment: { 
      backgroundColor: '#f6ecd1',
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,.05) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    },
    default: { backgroundColor: '#ffffff' }
  }
  return map[value] || map.default
})

// 动态注入字体（若包含 font_url）
const injectedFonts = new Set()
function ensureFontInjected(styleValue, fontUrl) {
  if (!fontUrl || !styleValue) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  let fullUrl = fontUrl
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`
  }
  const fontName = `font_${styleValue}`
  if (injectedFonts.has(fontName)) return fontName

  const ext = fullUrl.split('.').pop().toLowerCase()
  const formatMap = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }
  const fmt = formatMap[ext] || ''
  const css = `@font-face{font-family:'${fontName}'; src: url('${fullUrl}')${fmt ? ` format('${fmt}')` : ''}; font-display:swap;}`
  const styleEl = document.createElement('style')
  styleEl.innerText = css
  document.head.appendChild(styleEl)
  injectedFonts.add(fontName)
  return fontName
}

const fontStyleComputed = computed(() => {
  const value = props.fontStyle || 'default'
  const fontColor = props.fontColor || '#333'
  
  // 若已加载的字体样式包含 font_url，则优先使用
  const fontConfig = fontStyles.value.find(f => f.style_value === props.fontStyle)
  if (fontConfig && fontConfig.font_url) {
    const injectedName = ensureFontInjected(fontConfig.style_value, fontConfig.font_url)
    if (injectedName) {
      return {
        fontFamily: `${injectedName}, "Microsoft YaHei", Arial, sans-serif`,
        color: fontColor,
        fontSize: '17px',
        lineHeight: '2.2'
      }
    }
  }
  
  const map = {
    default: { 
      fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif', 
      color: fontColor,
      fontSize: '16px',
      lineHeight: '2'
    },
    kaiti: { 
      fontFamily: '"KaiTi", "楷体", "STKaiti", serif', 
      color: fontColor,
      fontSize: '17px',
      lineHeight: '2.2'
    },
    'kaiti-font': {
      fontFamily: '"KaiTi", "楷体", "STKaiti", serif', 
      color: fontColor,
      fontSize: '17px',
      lineHeight: '2.2'
    },
    xingshu: { 
      fontFamily: '"STXingkai", "华文行楷", "Xingkai SC", serif', 
      color: fontColor,
      fontSize: '18px',
      lineHeight: '2.3'
    },
    'xingshu-font': {
      fontFamily: '"STXingkai", "华文行楷", "Xingkai SC", serif', 
      color: fontColor,
      fontSize: '18px',
      lineHeight: '2.3'
    },
    'songti-font': {
      fontFamily: '"SimSun", "宋体", "STSong", serif',
      color: fontColor,
      fontSize: '16px',
      lineHeight: '2'
    }
  }
  return map[value] || map.default
})

const borderStyleComputed = computed(() => {
  // 优先从已加载的边框样式配置中，使用管理员上传的边框图片（preview_url）
  const border = borderStyles.value.find(b => b.style_value === props.borderStyle)
  if (border && border.preview_url) {
    let imageUrl = border.preview_url
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    const style = {
      backgroundImage: `url(${imageUrl})`,
      /* 只缩放，不裁剪边框图片 */
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '32px', // 通过内边距让信纸整体缩小，从而露出一圈边框
      boxSizing: 'border-box',
      borderRadius: '8px'
    }

    // 如果已成功计算出边框图片的宽高比，则作为默认展示比例；
    // 否则默认按照横板比例（4:3）展示
    style.aspectRatio = borderAspectRatio.value || (4 / 3)

    return style
  }

  // 兼容旧的纯 CSS 边框方案
  const value = props.borderStyle || 'none'
  
  const map = {
    none: { 
      border: 'none',
      padding: '0'
    },
    classic: { 
      border: '12px double #d8c3a5',
      padding: '24px',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 20px rgba(216, 195, 165, 0.2)'
    },
    'classic-border': {
      border: '12px double #d8c3a5',
      padding: '24px',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 20px rgba(216, 195, 165, 0.2)'
    },
    pattern: { 
      border: '8px solid #e3d7c1',
      padding: '24px',
      borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 215, 193, 0.3) 10px, rgba(227, 215, 193, 0.3) 20px)'
    },
    'pattern-border': {
      border: '8px solid #e3d7c1',
      padding: '24px',
      borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 215, 193, 0.3) 10px, rgba(227, 215, 193, 0.3) 20px)'
    }
  }
  return map[value] || map.none
})

const date = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})
</script>

<style scoped>
.letter-display {
  width: 100%;
}

.border-wrapper {
  /* 外层容器：让边框背景撑开，并在内部放入信纸 */
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.paper {
  width: 100%;
  /* 在有边框时，外层通过 aspect-ratio 控制整体比例，这里填满内部区域 */
  height: 100%;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  /* 注意：背景样式通过 :style="paperStyleComputed" 动态应用 */
}

.content {
  padding: 24px;
  min-height: 200px;
  white-space: pre-wrap;
  /* 注意：字体样式通过 :style="fontStyleComputed" 动态应用，这里不设置固定值 */
}

.footer {
  margin-top: 24px;
  text-align: right;
  color: #666;
  font-size: 14px;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.seal-container {
  perspective: 1000px;
  width: 120px;
  height: 120px;
}

.seal-paper {
  width: 100%;
  height: 100%;
  border-radius: 100%;
  overflow: hidden;
  transform-style: preserve-3d;
  transform-origin: bottom center;
  animation: sealAnimation 2.5s cubic-bezier(0.6, 0.05, 0.2, 1) forwards;
}

.seal-paper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes sealAnimation {
  0% {
    transform: rotateX(-70deg) translateZ(100px);
    box-shadow: inset 0px 400px 200px -200px rgba(0,0,0,0.4); 
  }
  80% {
    transform: translateZ(50px);
    box-shadow: inset 0px 0px 0px 0px rgba(0,0,0,0);
  }
  100% {
    transform: rotateX(0deg) translateZ(0);
  }
}
</style>

