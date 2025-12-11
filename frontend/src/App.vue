<template>
  <div id="app">
    <!-- 全局顶部导航栏 -->
    <TopNavbar />
    <!-- 主要内容区域，添加顶部间距避免被导航栏遮挡 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import TopNavbar from './components/TopNavbar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

.main-content {
  margin-top: 60px; /* 为固定导航栏留出空间 */
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    margin-top: 50px;
  }
}
</style>

