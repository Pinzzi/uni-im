// 暗色主题配置
export default {
  name: 'dark',
  displayName: '暗黑主题',
  // 主题变量
  variables: {
    // 主色
    '--primary-color': '#0A84FF',
    '--primary-color-hover': '#409EFF',
    '--primary-color-pressed': '#0060CB',
    '--primary-color-disabled': '#0A84FF40',
    
    // 辅助色
    '--secondary-color': '#32D74B',
    '--success-color': '#32D74B',
    '--warning-color': '#FF9F0A',
    '--error-color': '#FF453A',
    '--info-color': '#64748B',
    
    // 背景色
    '--bg-color-base': '#000000',
    '--bg-color-secondary': '#1C1C1E',
    '--bg-color-tertiary': '#2C2C2E',
    
    // 文字颜色
    '--text-color-primary': '#FFFFFF',
    '--text-color-secondary': '#EBEBF599',
    '--text-color-disabled': '#EBEBF566',
    
    // 边框颜色
    '--border-color-base': '#38383A',
    '--border-color-light': '#38383A80',
    
    // 功能色
    '--mask-color': 'rgba(0, 0, 0, 0.6)',
    '--scrollbar-color': '#38383A40',
    
    // 组件相关
    '--chat-bubble-bg': '#1C1C1E',
    '--chat-bubble-text': '#FFFFFF',
    '--navbar-bg': '#1C1C1E',
    '--navbar-text': '#FFFFFF',
    '--sidebar-bg': '#1C1C1E',
    '--card-bg': '#1C1C1E'
  },
  // 主题配置
  config: {
    appName: 'UniIM Dark',
    logo: '/static/logo/dark-logo.png',
    launchScreen: '/static/launch/dark-launch.png',
    chatBubbleStyle: 'sharp', // 聊天气泡样式
    darkMode: true,
    reducedMotion: false,
    blurEffect: true
  }
}