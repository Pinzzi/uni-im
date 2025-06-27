import { createSSRApp } from 'vue'
import App from './App'
import request from './common/request';
import emotion from './common/emotion.js';
import * as  enums from './common/enums.js';
import * as date from './common/date';
import * as socketApi from './common/wssocket';
import store from './store';
import { installI18n } from './i18n'
import LanguageSwitchTransition from './components/language-switch-transition/index.vue'

// 导入mock系统（仅开发环境）
const isDev = process.env.NODE_ENV !== 'production';
let mockSystem = null;
if (isDev) {
  mockSystem = import('./mock/index.js');
}

// #ifdef H5
import * as recorder from './common/recorder-h5';
// #endif
// #ifndef H5
import * as recorder from './common/recorder-app';
// #endif

export function createApp() {
  const app = createSSRApp(App)
  
  // Mount store first
  app.use(store)
  app.config.globalProperties.$store = store
  
  // Install i18n
  installI18n(app);
  
  // Register global component
  app.component('LanguageSwitchTransition', LanguageSwitchTransition)
  
  // Register global properties
  app.config.globalProperties.$http = request;
  app.config.globalProperties.$wsApi = socketApi;
  app.config.globalProperties.$emo = emotion;
  app.config.globalProperties.$enums = enums;
  app.config.globalProperties.$date = date;
  app.config.globalProperties.$rc = recorder;
  
  // 初始化mock系统（仅开发环境）
  if (isDev && mockSystem) {
    mockSystem.then(mock => {
      // 初始化mock系统
      mock.initMockSystem(app);
      
      // 在全局注册mock控制方法
      app.config.globalProperties.$mock = {
        enable: () => mock.toggleMockMode(true),
        disable: () => mock.toggleMockMode(false),
        toggle: (enable) => mock.toggleMockMode(enable)
      };
      
      console.log('[MOCK] Mock系统已加载，可通过全局 $mock 对象控制');
    }).catch(err => {
      console.error('[MOCK] Mock系统加载失败:', err);
    });
  }

  return {
    app,
    store
  }
}