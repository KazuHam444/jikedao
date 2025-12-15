<template>
  <div class="home">
    <div class="overlays">
      <img src="/part1.png" class="part part1" alt="part1" />
      <img src="/part2.png" class="part part2" alt="part2" />
      <img src="/part3.png" class="part part3" alt="part3" />
    </div>
    <el-container>
      <!-- 主要内容 -->
      <el-main>
        <div class="banner">
          <h2>跨越时空，连接无限可能</h2>
          <p>遥寄思绪，发于指端</p>
          <el-button
            type="text"
            size="large"
            class="start-image-button"
            @click="handleStartClick"
          >
            <img
              :src="currentImage"
              alt="开始写信"
              class="start-image"
              :class="{ open: isOpen }"
            />
          </el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 控制开始图片的动画与切换
const isOpen = ref(false)
const isAnimating = ref(false)

const currentImage = computed(() => (isOpen.value ? '/letter_open.png' : '/letter_close.png'))

function handleStartClick() {
  if (isAnimating.value) return
  isAnimating.value = true
  isOpen.value = true
  // 动画短暂延迟后跳转到写信页
  setTimeout(() => {
    router.push('/write')
    // 重置状态，避免长时间保持打开图
    setTimeout(() => {
      isOpen.value = false
      isAnimating.value = false
    }, 300)
  }, 400)
}

</script>

<style scoped>
.home {
  height: 100vh; /* 固定视口高度，禁止页面滚动 */
  overflow: hidden;
  /* 背景由固定的伪元素承载 */
  background: none;
  position: relative;
}

.home::before {
  content: '';
  position: fixed; /* 固定在视口，严格不随内容滚动 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  z-index: -2; /* 放到最底层 */
}

.home > * {
  position: relative;
  z-index: 1;
}

.overlays {
  position: fixed; /* 固定在视口，滑入后不随内容滚动 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1; /* 在内容下方、背景上方 */
  pointer-events: none;
}
.overlays .part {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.98;
  transform: translateY(-100%);
  animation-name: slideDown;
  animation-duration: 0.8s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-out;
}

.overlays .part1 { animation-delay: 0s; z-index: 0 }
.overlays .part2 { animation-delay: 0.25s; z-index: 1 }
.overlays .part3 { animation-delay: 0.5s; z-index: 2 }

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .overlays .part { opacity: 0.9 }
}

/* 导航栏已移至全局组件，删除原有样式 */

:deep(.el-container) {
  height: 100%;
  overflow: hidden;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding: 40px 0;
  width: 100%;
  box-sizing: border-box;
  animation: fadeIn 0.8s ease-out;
  position: relative;
  user-select: none;
  pointer-events: auto;
}

.banner h2 {
  font-size: 52px;
  margin-bottom: 24px;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.banner p {
  font-size: 22px;
  margin-bottom: 40px;
  opacity: 0.95;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.start-image-button {
  padding: 0;
  border-radius: 8px;
}

.start-image {
  max-height: 40vh; /* 缩小图片确保首页内容在单屏内不滚动 */
  max-width: 100%;
  width: auto;
  display: block;
  border-radius: 8px;
  object-fit: contain;
}

.start-image.open {
  transform: scale(1.02) translateY(-4px);
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.start-image-button {
  cursor: pointer;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px; /* 轻微下移，仍由弹性布局居中 */
}
@media (max-width: 768px) {
  .start-image {
    height: 220px; /* 移动端限制高度，避免过大 */
  }
  .start-image-button {
      margin-top: 8px; /* 移动端减小间距 */
    }
}
</style>

