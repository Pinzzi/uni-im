<template>
  <view class="theme-switcher">
    <view 
      class="theme-option"
      :class="{ active: currentTheme === 'default' }"
      @click="switchTheme('default')"
    >
      <text>默认主题</text>
    </view>
    <view 
      class="theme-option"
      :class="{ active: currentTheme === 'dark' }"
      @click="switchTheme('dark')"
    >
      <text>暗黑主题</text>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ThemeSwitcher',

  computed: {
    ...mapState({
      currentTheme: state => state.themeStore.currentTheme
    })
  },

  methods: {
    async switchTheme(themeName) {
      await this.$store.dispatch('themeStore/switchTheme', themeName)
    }
  }
}
</script>

<style lang="scss">
.theme-switcher {
  display: flex;
  padding: 10px;
  gap: 10px;

  .theme-option {
    padding: 8px 16px;
    border-radius: 4px;
    background-color: var(--theme-secondary-background);
    color: var(--theme-text);
    cursor: pointer;
    transition: var(--theme-transition);

    &.active {
      background-color: var(--theme-primary);
      color: #fff;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>