<template>
  <view class="transition-container transform-gpu" v-if="show">

    <loading></loading>
      <!-- 粒子背景 -->
      <!-- <view class="particle-layer" v-if="showParticles">
        <view v-for="i in 30" :key="i" class="particle" :style="particleStyle(i)"></view>
      </view> -->
      
      <!-- 语言标识 -->
      <view class="lang-indicator">
        <image :src="getFlagPath(langFlag)" class="flag" mode="aspectFit" />
        <view class="lang-name">{{ langName }}</view>
      </view>
    </view>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'LanguageSwitchTransition',
  props: {
    langFlag: String,
    langName: String
  },
  setup() {
    const showParticles = ref(false)
    const show = ref(false)

    const getFlagPath = (flagCode) => {
      return `/static/image/flags/${flagCode}.svg`
    }

    const particleStyle = (index) => {
      const size = Math.random() * 8 + 2
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 1}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
      }
    }

    let particleTimer
    let showTimer

    onMounted(() => {
      // 显示主容器
      show.value = true

      // 显示粒子效果 
      showParticles.value = true
      particleTimer = setTimeout(() => {
        showParticles.value = false
      }, 2000)

      // 设置自动消失
      showTimer = setTimeout(() => {
        show.value = false
      }, 3000)
    })

    onBeforeUnmount(() => {
      if (particleTimer) clearTimeout(particleTimer)  
      if (showTimer) clearTimeout(showTimer)
    })

    return {
      show,
      showParticles,
      getFlagPath,
      particleStyle
    }
  }
};
</script>

<style scoped>
.transition-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fade-in 0.3s ease-out;
  backdrop-filter: blur(5px);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.transform-gpu {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}

/* 粒子动画 */
.particle-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float-up 2s ease-out forwards;
}

@keyframes float-up {
  0% {
    transform: scale(0) translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(var(--tx, 100px), var(--ty, -100px));
    opacity: 0;
  }
}

/* 波浪效果 */
.wave-layer {
  display: none;
}

.wave {
  display: none;
}

@keyframes wave-animation {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 语言指示器 */
.lang-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scale-in 0.4s ease-out;
  margin-bottom: 50%;
}

.flag {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-bottom: 20px;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.flag:hover {
  transform: translateY(-5px);
}

.lang-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  opacity: 0.9;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes text-glow {
  0% {
    text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  100% {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 
                0 0 30px rgba(239, 68, 68, 0.6);
  }
}

/* 过渡动画 */
.lang-transition-enter-active,
.lang-transition-leave-active {
  transition: all 0.8s ease;
}

.lang-transition-enter-from,
.lang-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .flag {
    width: 60px;
    height: 45px;
  }
  
  .lang-name {
    font-size: 22px;
  }
}
</style>