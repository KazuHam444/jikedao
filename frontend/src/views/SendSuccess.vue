<template>
  <div class="send-success-page">
    <el-container>
      <el-header>
        <h2>发送成功</h2>
      </el-header>
      <el-main>
        <div class="success-wrap">
          <div class="checkmark">
            <svg viewBox="0 0 52 52">
              <path d="M14 27l7 7 17-17"></path>
            </svg>
          </div>
          <h3>你的信件已成功发送</h3>
          <p style="color:#666;margin:8px 0">信件 ID：{{ letterId }}</p>
          <div style="display:flex;gap:12px;margin-top:16px;justify-content:center;">
            <el-button type="primary" @click="goHome">返回首页</el-button>
            <el-button @click="continueWriting">继续写信</el-button>
            <el-button type="text" @click="viewDetail" v-if="letterId">查看信件详情</el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const letterId = route.params.id

function goHome(){ router.push('/') }
function continueWriting(){ router.push({ name: 'write' }) }
function viewDetail(){ if(letterId) router.push({ name: 'letter-detail', params: { id: letterId } }) }
</script>

<style scoped>
.send-success-page { min-height:100vh; background: linear-gradient(135deg,#f0f4ff,#eef6f1); }
.success-wrap{max-width:720px;margin:60px auto;text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.08)}
.checkmark{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#67d28d,#2fb05b);box-shadow:0 6px 18px rgba(47,176,91,0.12);margin:0 auto 12px}
.checkmark svg{width:44px;height:44px;fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
</style>
