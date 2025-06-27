<template>
  <view class="theme-switcher">
    <view class="switch-container" @click="toggleTheme">
      <view class="switch-track">
        <text class="icon sun-icon" :class="{ active: currentTheme === 'default' }">☀️</text>
        <text class="icon moon-icon" :class="{ active: currentTheme === 'dark' }">🌙</text>
      </view>
      <view class="switch-thumb" :class="{ 'is-dark': currentTheme === 'dark' }"></view>
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
    },
    
    async toggleTheme() {
      const newTheme = this.currentTheme === 'default' ? 'dark' : 'default'
      await this.switchTheme(newTheme)
    }
  }
}
</script>

<style lang="scss">
.theme-switcher {
  display: flex;
  padding: 10px;
  justify-content: center;

  .switch-container {
    position: relative;
    cursor: pointer;
    width: 70px;
    height: 34px;
  }

  .switch-track {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #e0e8ed; // #dfdfdf;
    border-radius: 34px;
    padding: 0 5px;
    box-sizing: border-box;
    transition: background-color 0.3s ease;

    .icon {
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.3s ease;
      z-index: 1;

      &.active {
        opacity: 1;
      }
    }
  }

  .switch-thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 26px;
    height: 26px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &.is-dark {
      transform: translateX(36px);
    }
  }
}
</style>