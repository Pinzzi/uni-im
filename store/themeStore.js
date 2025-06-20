import defaultTheme from '../themes/default.js'
import darkTheme from '../themes/dark.js'

// 设置CSS变量到根元素
function applyThemeVariables(variables) {
  const root = document.documentElement
  
  // 添加过渡效果
  root.style.transition = 'all 0.3s ease-in-out'
  
  // 递归处理嵌套变量
  const applyNestedVariables = (vars, prefix = '') => {
    Object.entries(vars).forEach(([key, value]) => {
      if (typeof value === 'object') {
        applyNestedVariables(value, `${prefix}${key}-`)
      } else {
        root.style.setProperty(`--theme-${prefix}${key}`, value)
      }
    })
  }
  
  applyNestedVariables(variables)
}

// 处理应用名称更新
function updateAppName(name) {
  // H5环境
  if (document) {
    document.title = name
  }
  // App环境
  // #ifdef APP-PLUS
  plus.navigator.setTitle({
    title: name
  })
  // #endif
}

export default {
  namespaced: true,
  state: {
    currentTheme: 'default',
    themes: {
      default: defaultTheme,
      dark: darkTheme
    }
  },
  getters: {
    theme: state => state.themes[state.currentTheme],
    themeVariables: (_, getters) => getters.theme.variables,
    themeConfig: (_, getters) => getters.theme.config,
    // 新增计算属性用于模板
    colors: (_, getters) => ({
      primary: `var(--theme-primary)`,
      secondary: `var(--theme-secondary)`,
      background: `var(--theme-background)`,
      text: `var(--theme-text)`,
      accent: `var(--theme-accent)`,
      surface: `var(--theme-surface)`
    }),
    spacing: (_, getters) => ({
      small: `var(--theme-spacing-small)`,
      medium: `var(--theme-spacing-medium)`,
      large: `var(--theme-spacing-large)`,
      xl: `var(--theme-spacing-xl)`
    }),
    fontSize: (_, getters) => ({
      small: `var(--theme-font-size-small)`,
      medium: `var(--theme-font-size-medium)`,
      large: `var(--theme-font-size-large)`,
      xl: `var(--theme-font-size-xl)`
    }),
    isDarkMode: (_, getters) => getters.theme.isDark,
    themeMode: (_, getters) => getters.isDarkMode ? 'dark' : 'light'
  },
  mutations: {
    SET_THEME(state, themeName) {
      state.currentTheme = themeName
    }
  },
  actions: {
    // 初始化主题
    async initTheme({ dispatch, state, getters }) {
      try {
        // 获取存储的主题设置
        const savedTheme = uni.getStorageSync('current_theme')

        // 如果有已保存的主题且主题存在，使用已保存的主题
        if (savedTheme && state.themes[savedTheme]) {
          await dispatch('switchTheme', savedTheme)
        } else {
          // 使用默认主题
          await dispatch('switchTheme', 'default')
        }

        // 确保主题变量被正确应用
        const themeVars = getters.themeVariables
        if (themeVars) {
          applyThemeVariables(themeVars)
        }

        return true
      } catch (e) {
        console.error('Failed to initialize theme:', e)
        await dispatch('switchTheme', 'default')
        return false
      }
    },

    // 切换主题
    async switchTheme({ commit, getters, state }, themeName) {
      if (!state.themes[themeName]) {
        console.error(`Theme "${themeName}" not found`)
        return false
      }

      try {
        // 添加主题切换过渡class
        document.body.classList.add('theme-switching')

        // 更新状态
        commit('SET_THEME', themeName)

        // 应用CSS变量
        const themeVars = getters.themeVariables
        applyThemeVariables(themeVars)

        // 更新应用名称
        if (getters.themeConfig && getters.themeConfig.appName) {
          updateAppName(getters.themeConfig.appName)
        }

        // 存储主题偏好
        await uni.setStorage({
          key: 'current_theme',
          data: themeName
        })

        // 触发主题切换事件
        uni.$emit('themeChanged', {
          theme: themeName,
          isDark: getters.isDarkMode
        })

        // 移除过渡class
        setTimeout(() => {
          document.body.classList.remove('theme-switching')
        }, 300)

        return true
      } catch (error) {
        console.error('Theme switch failed:', error)
        document.body.classList.remove('theme-switching')
        return false
      }
    }
  }
}