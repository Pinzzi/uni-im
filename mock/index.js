// Mock 数据主入口文件
import { setupMockAPI, setupMockHttp } from './api.js';
import { setupAutoLogin, toggleMockMode } from './autoLogin.js';
import { mockUser } from './user.js';

// 导出所有模拟功能
export {
  setupMockAPI,
  setupMockHttp,
  setupAutoLogin,
  toggleMockMode,
  mockUser
};

// 初始化 Mock 系统
export function initMockSystem(app) {
  // 判断是否为开发环境
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isDev) {
    console.warn('[MOCK] 生产环境不应启用模拟数据');
    return;
  }

  // 设置 API 拦截
  setupMockAPI();

  // 如果提供了 app 实例，设置 HTTP 拦截
  if (app) {
    setupMockHttp(app);
  }

  // 尝试自动登录
  setupAutoLogin();

  // 在 app 实例上提供 toggleMock 方法
  if (app) {
    app.config.globalProperties.$toggleMock = toggleMockMode;
  }

  console.log('[MOCK] Mock系统初始化完成');
}
