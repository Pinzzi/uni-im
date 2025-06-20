<template>
  <view class="language-switcher">
    <view class="current-language" @click="toggleLanguageList">
      <uni-icons 
        :type="showList ? 'top' : 'bottom'" 
        size="16" 
        color="#333" 
        class="arrow-icon"
      />
      <image class="flag-icon" src="/static/image/language-switcher.png" mode="aspectFit" />
      <text class="language-label">{{ selectedLabel }}</text>
    </view>

    <!-- 只有icon不显示当前语言 -->
    <!-- <view  @click="toggleLanguageList">
      <image class="switcher-icon" src="/static/image/language-switcher.png" mode="aspectFit" />
    </view> -->
    
    <view v-if="showList" class="language-list">
      <view 
        v-for="(lang, index) in availableLanguages" 
        :key="lang.value"
        class="language-item"
        :class="{selected: currentLang === lang.value}"
        @click="selectLanguage(lang)"
      >
        <image class="flag-icon" :src="getFlagPath(lang.value)" mode="aspectFit" />
        <text class="language-text">{{ lang.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { setLocale } from '@/i18n'
import i18n from '@/i18n'

export default {
  setup() {
    const store = useStore()
    const showList = ref(false)
    const listTop = ref(0)
    
    const availableLanguages = [
      { value: 'zh-CN', label: '简体中文', flag: 'zh-CN' },
      { value: 'de-DE', label: 'Deutsch', flag: 'de-DE' },
      { value: 'en-US', label: 'English', flag: 'en-US' },
      { value: 'es_ES', label: 'Español', flag: 'es-ES' },
      { value: 'es-AR', label: 'Argentina', flag: 'en-AR' },
      { value: 'fr-FR', label: 'Français', flag: 'fr-FR' },
      { value: 'it-IT', label: 'Italiano', flag: 'it-IT' },
      { value: 'ja', label: '日本語', flag: 'ja' },
      { value: 'ko', label: '한국어', flag: 'ko' },
      { value: 'ms-MY', label: 'Malaysia', flag: 'ms-MY' }, // 区分标准马来语(ms)和马来西亚变体(ms_MY)
      { value: 'pt-BR', label: 'Brasileiro', flag: 'pt-BR' },
      { value: 'th', label: 'ภาษา', flag: 'th' },
      { value: 'vi-VN', label: 'Tiếng Việt', flag: 'vi-VN' },
    ]
    
    const currentLang = ref('zh-CN')
    
    onMounted(() => {
      try {
        if (i18n?.global?.locale?.value) {
          currentLang.value = i18n.global.locale.value
        }
        else if (uni.$i18n?.locale?.value) {
          currentLang.value = uni.$i18n.locale.value
        }
      } catch (e) {
        console.error('Failed to get language:', e)
        currentLang.value = 'zh-CN'
      }
    })
    
    const selectedLabel = computed(() => {
      const lang = availableLanguages.find(l => l.value === currentLang.value)
      return lang ? lang.label : 'Language'
    })
    
    const currentFlag = computed(() => {
      const lang = availableLanguages.find(l => l.value === currentLang.value)
      return lang ? getFlagPath(lang.value) : getFlagPath('zh-CN')
    })
    
    // 获取国旗图片路径
    const getFlagPath = (langCode) => {
      return `/static/image/flags/${langCode}.svg`
    }
    
    // 切换语言列表显示
    const toggleLanguageList = (e) => {
      showList.value = !showList.value
      // 获取元素位置
      uni.createSelectorQuery()
        .select('.current-language')
        .boundingClientRect(data => {
          if (data) {
            listTop.value = data.bottom
          }
        })
        .exec()
    }
    
    // 选择语言
    const selectLanguage = async (lang) => {
      try {
        // 先触发过渡动画
        await store.dispatch('transitionStore/triggerLanguageTransition', {
          langFlag: lang.value,
          langName: lang.label
        })

        // 动画结束后切换语言
        setLocale(lang.value)
        currentLang.value = lang.value
        showList.value = false
      } catch (error) {
        console.error('Failed to change language:', error)
        uni.showToast({
          title: 'Language switch failed',
          icon: 'none'
        })
      }
    }
    
    // 点击外部关闭列表
    const handleClickOutside = (e) => {
      if (!e.target.closest('.language-switcher')) {
        showList.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    return {
      showList,
      listTop,
      currentLang,
      availableLanguages,
      selectedLabel,
      currentFlag,
      toggleLanguageList,
      selectLanguage,
      getFlagPath
    }
  }
}
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
  z-index: 1000;
  min-width: 150px;
}

.current-language {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  padding: 10px 15px;
  border-radius: 30px;
  background: linear-gradient(135deg, #f5f7fa, #e4e7eb);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e1e5e9;
}

.current-language:hover {
  background: linear-gradient(135deg, #ebedf0, #d8dcdf);
  transform: translateY(-2px);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.06),
              0 8px 8px rgba(0, 0, 0, 0.09),
              0 12px 12px rgba(0, 0, 0, 0.12);
}

.switcher-icon {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  object-fit: cover;
  order: 1;
}

.flag-icon {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
  order: 1;
}

.language-label {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  flex-grow: 1;
  order: 2;
}

.arrow-icon {
  transition: transform 0.3s ease;
  order: 3;
}

.language-list {
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1001;
  animation: dropDown 0.3s ease;
  margin-top: 5px;
}

.language-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.language-item:last-child {
  border-bottom: none;
}

.language-item:hover {
  background-color: #f8fafc;
  transform: translateX(5px);
}

.language-item.selected {
  background: linear-gradient(to right, #ebf4ff, #f0f9ff);
  border-left: 3px solid #3b82f6;
}

.language-text {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* 动画效果 */
@keyframes dropDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .language-switcher {
    min-width: 130px;
  }
  
  .current-language {
    padding: 8px 12px;
  }
  
  .language-label {
    font-size: 13px;
  }
}
</style>