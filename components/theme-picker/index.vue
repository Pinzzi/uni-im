
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

    const themes = computed(() => {
      const themeStore = store.state.themeStore.themes;
      return [
        {
          name: 'default',
          label: uni.$t('mo_ren_zhu_ti'),
          primaryColor: themeStore.default.variables['primary-color']
        },
        {
          name: 'dark',
          label: uni.$t('an_hei_zhu_ti'),
          primaryColor: '#233333'
        }
      ]
    })

    const showPicker = () => {
      popup.value.open('bottom')
    }

    const changeTheme = (themeName) => {
      store.dispatch('themeStore/switchTheme', themeName)
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

  .theme-icon:hover {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.06),
                0 8px 8px rgba(0, 0, 0, 0.09),
                0 12px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    border-radius: 12px;
  }

  .theme-list {
    padding: 16px;
    background-color: var(--theme-bg);
    border-radius: 16px 16px 0 0;

    .theme-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      gap: 8px;
      cursor: pointer;
      color: var(--theme-text);

      &:active {
        opacity: 0.7;
      }

      .theme-color {
        width: 24px;
        height: 24px;
        border-radius: 12px;
      }

      .theme-name {
        font-size: 16px;
        color: var(--theme-text);
      }
    }
  }
}
</style>