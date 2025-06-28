// API 请求模拟
import { mockUser } from './user.js';

// 模拟登录响应数据
const mockLoginResponse = function(req) {
  // 获取存储的token，如果存在并且未过期则继续使用
  let token = uni.getStorageSync('token') || mockUser.token;
  let expires = uni.getStorageSync('token_expires') || (Date.now() + 24 * 60 * 60 * 1000);

  // 创建响应数据
  const response = {
    code: 200,
    data: {
      user: mockUser,
      token: token,
      expires: expires
    },
    message: '登录成功'
  };

  // 存储token信息以便刷新页面后仍然可用
  uni.setStorageSync('token', response.data.token);
  uni.setStorageSync('token_expires', response.data.expires);
  uni.setStorageSync('user', JSON.stringify(mockUser));

  return response;
};

// 定义需要拦截的 API 路径
const MOCK_APIS = {
  '/login': mockLoginResponse,
  '/verify-device': mockLoginResponse
};

// API 请求拦截器
export function setupMockAPI() {
  // 保存原始的 uni.request 方法
  const originalRequest = uni.request;

  // 重写 uni.request 方法
  uni.request = function(options) {
    const url = options.url;

    // 检查是否为需要拦截的 API
    for (const path in MOCK_APIS) {
      if (url.includes(path)) {
        console.log('[MOCK] 拦截请求:', url);

        // 模拟网络延迟
        setTimeout(() => {
          const handler = MOCK_APIS[path];
          const response = typeof handler === 'function' ? handler(options) : handler;
          if (options.success) {
            options.success(response);
          }
        }, 300);

        // 返回一个对象以兼容 Promise 用法
        return {
          abort: function() {}
        };
      }
    }

    // 不拦截的请求使用原始方法处理
    return originalRequest.call(this, options);
  };

  console.log('[MOCK] API 模拟已启用');
}

// 针对自定义 $http 方法的拦截器
export function setupMockHttp(app) {
  // 保存原始的 $http 方法
  const originalHttp = app.config.globalProperties.$http;

  // 重写 $http 方法
  app.config.globalProperties.$http = function(options) {
    const url = options.url;

    // 检查是否为需要拦截的 API
    for (const path in MOCK_APIS) {
      if (url.includes(path)) {
        console.log('[MOCK] 拦截 $http 请求:', url);

        // 返回模拟响应的 Promise
        return new Promise((resolve) => {
          setTimeout(() => {
            const handler = MOCK_APIS[path];
            const response = typeof handler === 'function' ? handler(options) : handler;
            resolve(response.data);
          }, 300);
        });
      }
    }

    // 不拦截的请求使用原始方法处理
    return originalHttp.call(this, options);
  };
}