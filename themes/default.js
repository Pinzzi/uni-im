// 默认主题配置
export default {
  name: 'default', 
  displayName: '默认主题',
  // 主题变量
  variables: {
    'primary': '#007AFF',
    'accent': '#4CD964', 
    'bg': '#FFFFFF',
    'text': '#333333',
    'border': '#E5E5E5',
    'chat': '#F1F1F1',
    'chatText': '#333333',
    'nav': '#FFFFFF',
    'navText': '#333333'
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