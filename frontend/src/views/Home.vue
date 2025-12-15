<template>
  <div class="home">
    <el-container>
      <!-- 主要内容 -->
      <el-main>
        <div class="banner">
          <h2>跨越时空，连接无限可能</h2>
          <p>只有你想不到的，没有我们送不到的</p>
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
  height: 100vh;
  overflow: hidden;
  /* 使用全局 CSS 变量 --bg-login（指向 /background.jpg）作为首页背景 */
  background-image: var(--bg-login);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 移除紫色透明遮罩，保留空背景以直接显示图片 */
  background: transparent;
  z-index: 0;
}

.home > * {
  position: relative;
  z-index: 1;
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
  max-height: 60vh; /* 限制高度，避免造成滚动条 */
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

