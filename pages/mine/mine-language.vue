<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      <text class="title">{{ $t('settings_languageSettings') }}</text>
    </view>

    <view class="language-list">
      <view
        v-for="(lang, index) in availableLanguages"
        :key="lang.value"
        class="language-item"
        @click="selectLanguage(lang)"
      >
        <view class="language-info">
          <image class="flag-icon" :src="getFlagPath(lang.value)" mode="aspectFit" />
          <text class="language-name">{{ lang.label }}</text>
        </view>
        <text v-if="currentLang === lang.value" class="selected-icon iconfont icon-checkbox-checked"></text>
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
    const currentLang = ref('zh-CN')

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
      { value: 'ms-MY', label: 'Malaysia', flag: 'ms-MY' },
      { value: 'pt-BR', label: 'Brasileiro', flag: 'pt-BR' },
      { value: 'th', label: 'ภาษา', flag: 'th' },
      { value: 'vi-VN', label: 'Tiếng Việt', flag: 'vi-VN' },
    ]

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

    // 获取国旗图片路径
    const getFlagPath = (langCode) => {
      return `/static/image/flags/${langCode}.svg`
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

        // 显示切换成功提示
        uni.showToast({
          title: uni.$t('yu_yan_qie_huan_cheng_gong'),
          icon: 'success'
        })

        // 延迟返回上一页，让用户看到选择结果
        setTimeout(() => {
          goBack()
        }, 1000)
      } catch (error) {
        console.error('Failed to change language:', error)
        uni.showToast({
          title: uni.$t('yu_yan_qie_huan_shi_bai'),
          icon: 'none'
        })
      }
    }

    // 返回上一页
    const goBack = () => {
      uni.navigateBack()
    }

    return {
      currentLang,
      availableLanguages,
      selectLanguage,
      getFlagPath,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: var(--bg-color, #FFFFFF);
  height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid var(--border-color, #EEEEEE);
  position: relative;

  .back-btn {
    position: absolute;
    left: 30rpx;
    font-size: 40rpx;
    color: var(--text-color, #333333);
  }

  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: 500;
    color: var(--text-color, #333333);
  }
}

.language-list {
  padding: 20rpx 0;

  .language-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid var(--border-color, #EEEEEE);

    &:active {
      background-color: var(--hover-color, #F5F5F5);
    }

    .language-info {
      display: flex;
      align-items: center;

      .flag-icon {
        width: 50rpx;
        height: 50rpx;
        border-radius: 4rpx;
        margin-right: 20rpx;
      }

      .language-name {
        font-size: 32rpx;
        color: var(--text-color, #333333);
      }
    }

    .selected-icon {
      color: var(--theme-primary, #007AFF);
      font-size: 40rpx;
    }
  }
}
</style>
