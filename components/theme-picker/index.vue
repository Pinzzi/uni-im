
<template>
  <view class="theme-picker">
    <image class="theme-icon" :src="themeIconSrc" @click="showPicker"></image>
    <uni-popup ref="popup" type="bottom">
      <view class="theme-list">
        <view class="theme-item" v-for="theme in themes" :key="theme.name" @click="changeTheme(theme.name)">
          <view class="theme-color" :style="{ backgroundColor: theme.primaryColor }"></view>
          <text class="theme-name">{{ theme.label }}</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  name: 'ThemePicker',
  setup() {
    const store = useStore()
    const popup = ref(null)
    const themeIconSrc = computed(() => {
      return '/static/image/theme.png'
    })

    const themes = [
      { name: 'default', label: '默认主题', primaryColor: '#2979ff' },
      { name: 'dark', label: '深色主题', primaryColor: '#1c1c1e' }
    ]

    const showPicker = () => {
      popup.value.open('bottom')
    }

    const changeTheme = (themeName) => {
      store.dispatch('themeStore/changeTheme', themeName)
      popup.value.close()
    }

    return {
      popup,
      themes,
      showPicker,
      changeTheme,
      themeIconSrc
    }
  }
}
</script>

<style lang="scss">
.theme-picker {
  .theme-icon {
    width: 24px;
    height: 24px;
    padding: 8px;
  }

  .theme-list {
    padding: 16px;
    background-color: #fff;
    border-radius: 16px 16px 0 0;

    .theme-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }

      .theme-color {
        width: 24px;
        height: 24px;
        border-radius: 12px;
        margin-right: 12px;
      }

      .theme-name {
        font-size: 16px;
        color: #333;
      }
    }
  }
}
</style>
