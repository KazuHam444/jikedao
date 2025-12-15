<template>
  <div class="preview-wrap">
    <div class="seal"></div>
    <div class="paper" :style="paperStyle">
      <div class="border" :style="borderStyle">
        <div class="content" :style="fontStyleComputed" v-html="formattedContent"></div>
      </div>
      <div class="footer">致：{{ figureName }} · {{ date }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  content: String,
  paper: Object, // { style_value, preview_url }
  font: Object,
  border: Object,
  figureName: String
})

const formattedContent = computed(() => {
  if (!props.content) return ''
  return (`<h3 style="text-align:center;margin-bottom:12px;">${props.title || ''}</h3>` + props.content.replace(/\n/g, '<br>'))
})

const paperStyle = computed(() => {
  if (props.paper && props.paper.preview_url) {
    // 获取完整的图片URL
    let imageUrl = props.paper.preview_url
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
  // 根据style_value应用样式
  const value = props.paper?.style_value || 'default'
  const map = {
    classic: { 
      background: '#fff8f0',
      backgroundImage: 'linear-gradient(45deg, #fff8f0 25%, transparent 25%), linear-gradient(-45deg, #fff8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff8f0 75%), linear-gradient(-45deg, transparent 75%, #fff8f0 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    },
    parchment: { 
      background: '#f6ecd1',
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,.05) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    },
    default: { background: '#ffffff' }
  }
  return map[value] || map.default
})

// 动态注入字体（若样式包含 font_url）
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

  // 根据扩展名猜测格式
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
  const value = props.font?.style_value || 'default'

  // 若有 font_url，优先动态注入并使用
  if (props.font && props.font.font_url) {
    const injectedName = ensureFontInjected(props.font.style_value || value, props.font.font_url)
    if (injectedName) {
      return {
        fontFamily: `${injectedName}, "Microsoft YaHei", Arial, sans-serif`,
        color: '#333',
        fontSize: '17px',
        lineHeight: '2.2'
      }
    }
  }

  const map = {
    default: { 
      fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif', 
      color: '#333',
      fontSize: '16px',
      lineHeight: '2'
    },
    kaiti: { 
      fontFamily: '"KaiTi", "楷体", "STKaiti", serif', 
      color: '#333',
      fontSize: '17px',
      lineHeight: '2.2'
    },
    'kaiti-font': { 
      fontFamily: '"KaiTi", "楷体", "STKaiti", serif', 
      color: '#333',
      fontSize: '17px',
      lineHeight: '2.2'
    },
    xingshu: { 
      fontFamily: '"STXingkai", "华文行楷", "Xingkai SC", serif', 
      color: '#333',
      fontSize: '18px',
      lineHeight: '2.3'
    },
    'xingshu-font': { 
      fontFamily: '"STXingkai", "华文行楷", "Xingkai SC", serif', 
      color: '#333',
      fontSize: '18px',
      lineHeight: '2.3'
    },
    'songti-font': { 
      fontFamily: '"SimSun", "宋体", "STSong", serif', 
      color: '#333',
      fontSize: '16px',
      lineHeight: '2'
    }
  }
  return map[value] || map.default
})

const borderStyle = computed(() => {
  const value = props.border?.style_value || 'none'
  const map = {
    none: { 
      border: 'none',
      padding: '0'
    },
    classic: { 
      border: '12px double #d8c3a5',
      padding: '20px',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 20px rgba(216, 195, 165, 0.2)'
    },
    'classic-border': { 
      border: '12px double #d8c3a5',
      padding: '20px',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 20px rgba(216, 195, 165, 0.2)'
    },
    pattern: { 
      border: '8px solid #e3d7c1',
      padding: '20px',
      borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 215, 193, 0.3) 10px, rgba(227, 215, 193, 0.3) 20px)'
    },
    'pattern-border': { 
      border: '8px solid #e3d7c1',
      padding: '20px',
      borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 215, 193, 0.3) 10px, rgba(227, 215, 193, 0.3) 20px)'
    }
  }
  return map[value] || map.none
})

const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<style scoped>
.preview-wrap {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}


.paper {
  width: 600px;
  min-height: 320px;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.border {
  background: rgba(255,255,255,0.95);
  min-height: 260px;
}
.content {
  padding: 18px;
  line-height: 1.9;
  font-size: 16px;
}
.footer {
  margin-top: 18px;
  text-align: right;
  color: #666;
  font-size: 13px;
}
</style>
