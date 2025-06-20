// 默认主题配置
export default {
  name: 'default', 
  displayName: '默认主题',

  // 主题变量
  variables: {
    // 主色
    'primary': '#007AFF',
    'primary-color': '#007AFF',
    'primary-color-hover': '#409EFF',
    'primary-color-pressed': '#0060CB',
    'primary-color-disabled': '#0A84FF40',
    
    // 辅助色
    'secondary': '#afcbf9',
    'secondary-color': '#afcbf9',
    'success': '#32D74B',
    'success-color': '#32D74B',
    'warning': '#FF9F0A',
    'warning-color': '#FF9F0A',
    'error': '#FF453A',
    'error-color': '#FF453A',
    'info': '#64748B',
    'info-color': '#64748B',
    
    // 背景色
    'bg': '#FFFFFF',
    'bg-color': '#FFFFFF',
    'bg-color-base': '#FFFFFF',
    'bg-color-secondary': '#F5F5F5',
    'bg-color-tertiary': '#FAFAFA',
    
    // 文字颜色
    'text': '#efefef',
    'text-color': '#efefef',
    'text-color-primary': '#233333',
    'text-color-secondary': '#666666',
    'text-color-disabled': '#999999',
    
    // 边框颜色
    'border': '#E5E5E5',
    'border-color': '#E5E5E5',
    'border-color-base': '#E5E5E5',
    'border-color-light': '#F0F0F0',
    
    // 功能色
    'mask': 'rgba(0, 0, 0, 0.6)',
    'mask-color': 'rgba(0, 0, 0, 0.6)',
    'scrollbar': '#E5E5E5',
    'scrollbar-color': '#E5E5E5',
    
    // 组件相关
    'chat-bubble': '#F1F1F1',
    'chat-bubble-bg': '#F1F1F1',
    'chat-bubble-text': '#333333',
    'navbar': '#FFFFFF',
    'navbar-bg': '#FFFFFF',
    'navbar-text': '#333333',
    'sidebar': '#F5F5F5',
    'sidebar-bg': '#F5F5F5',
    'card': '#FFFFFF',
    'card-bg': '#FFFFFF'
  },
  // 主题配置
  config: {
    appName: 'UniIM',
    logo: '/static/logo/default-logo.png',
    launchScreen: '/static/launch/default-launch.png',
    chatBubbleStyle: 'round', // 聊天气泡样式
    darkMode: false, // 暗色模式
    animations: true, // 启用动画
    radius: 8 // 默认圆角
  }
}