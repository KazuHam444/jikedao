<template>
  <div class="preview-wrap">
    <!-- 外层边框容器：使用管理员上传的边框图片 -->
    <div class="border-wrapper" :style="borderStyle">
      <!-- 内层信纸本体：使用信纸样式图片 -->
      <div class="paper" :style="paperStyle">
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
import { computed } from 'vue'

const props = defineProps({
  title: String,
  content: String,
  paper: Object, // { style_value, preview_url }
  font: Object,
  border: Object,
  figureName: String,
  fontColor: String // 字体颜色
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
  const fontColor = props.fontColor || '#333'

  // 若有 font_url，优先动态注入并使用
  if (props.font && props.font.font_url) {
    const injectedName = ensureFontInjected(props.font.style_value || value, props.font.font_url)
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

const borderStyle = computed(() => {
  // 优先使用管理员上传的边框样式图片（preview_url）
  if (props.border && props.border.preview_url) {
    let imageUrl = props.border.preview_url
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '40px', // 通过内边距让信纸整体缩小，从而露出一圈边框
      boxSizing: 'border-box'
    }
  }

  // 兼容旧的纯 CSS 边框方案
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
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

.border-wrapper {
  /* 外层容器：控制整体宽高和居中 */
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
}

.paper {
  width: 600px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  background-size: cover;
  background-position: center;
}

.content {
  padding: 40px;
  line-height: 1.9;
  font-size: 16px;
  flex: 1;
  overflow: hidden;
}

.footer {
  padding: 0 40px 40px;
  text-align: right;
  color: #666;
  font-size: 14px;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.signature-text {
  margin-bottom: 8px;
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
