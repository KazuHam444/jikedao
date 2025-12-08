<template>
  <div class="like-btn" @click.stop.prevent="toggleLike">
    <transition name="pop">
      <el-icon v-if="liked" class="heart liked"><span>❤</span></el-icon>
      <el-icon v-else class="heart"><span>❤</span></el-icon>
    </transition>
    <span class="count">{{ count }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import api from '@/utils/api'

const props = defineProps({ letterId: Number, initialCount: Number })
const emit = defineEmits(['toggled'])

const liked = ref(false)
const count = ref(props.initialCount || 0)

async function fetchCount(){
  try{
    const res = await api.get(`/likes/count/${props.letterId}`)
    if(res.data.success) count.value = res.data.data.count
  }catch(e){}
}

async function toggleLike(){
  try{
    const res = await api.post('/likes/toggle', { letter_id: props.letterId })
    if(res.data.success){
      liked.value = res.data.data.liked
      count.value += liked.value ? 1 : -1
      emit('toggled', { liked: liked.value })
    }
  }catch(e){
    // ignore
  }
}

onMounted(()=>{ fetchCount() })
</script>

<style scoped>
.like-btn{
  display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;
}
.heart{ font-size:20px; color:#999; }
.heart.liked{ color:#ff4d6d; transform: scale(1.2); filter: drop-shadow(0 6px 10px rgba(255,77,109,0.25)); }
.count{ font-size:13px; color:#666 }

.pop-enter-active, .pop-leave-active { transition: transform .18s ease; }
.pop-enter-from { transform: scale(0.6); }
.pop-enter-to { transform: scale(1); }

/* 小红书风格上升粒子效果（简化版） */
.like-btn::after{
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle at 30% 30%, #ffd6e0, #ff4d6d);
  border-radius:50%;
  opacity:0;
  transform: translateY(0) scale(0.6);
}
.heart.liked + .count { color:#ff4d6d }

</style>
