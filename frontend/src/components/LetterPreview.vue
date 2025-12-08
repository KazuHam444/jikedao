<template>
  <div class="preview-wrap">
    <div class="envelope">
      <div class="seal"></div>
    </div>
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
    return {
      backgroundImage: `url(${props.paper.preview_url})`,
      backgroundSize: 'cover'
    }
  }
  // 简单内联样式依据 style_value
  const map = {
    classic: { background: '#fff8f0' },
    parchment: { background: '#f6ecd1' },
    default: { background: '#ffffff' }
  }
  return map[props.paper?.style_value || 'default'] || map.default
})

const fontStyleComputed = computed(() => {
  const value = props.font?.style_value || 'default'
  const map = {
    default: { fontFamily: `"Microsoft YaHei", Arial, sans-serif`, color: '#333' },
    kaiti: { fontFamily: 'KaiTi, serif', color: '#333' },
    xingshu: { fontFamily: 'STXingkai, serif', color: '#333' }
  }
  return map[value] || map.default
})

const borderStyle = computed(() => {
  const value = props.border?.style_value || 'none'
  if (value === 'none') return { border: 'none' }
  if (value === 'classic') return { border: '12px double #d8c3a5', padding: '20px' }
  if (value === 'pattern') return { border: '8px solid #e3d7c1', padding: '20px' }
  return { border: 'none' }
})

const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<style scoped>
.preview-wrap {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.envelope {
  width: 140px;
  height: 100px;
  background: linear-gradient(135deg,#b98f6b,#8b5a2b);
  border-radius: 6px;
  position: relative;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
}
.envelope .seal {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.15);
  position: absolute;
  right: 12px;
  bottom: 12px;
  border-radius: 50%;
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
