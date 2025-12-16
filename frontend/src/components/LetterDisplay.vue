<template>
  <div class="letter-display">
    <div class="paper" :style="paperStyleComputed">
      <div class="content" :style="fontStyleComputed" v-html="formattedContent"></div>
      <div class="footer" v-if="figureName">
        致：{{ figureName }} · {{ date }}
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
    }
    ,
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

.paper {
  width: 100%;
  min-height: 400px;
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
}
</style>

