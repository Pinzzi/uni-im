// API 请求模拟
import { mockUser } from './user.js';

// 模拟登录响应数据
const mockLoginResponse = {
  code: 200,
  data: {
    user: mockUser,
    token: mockUser.token,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
  },
  message: '登录成功'
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
          const response = MOCK_APIS[path];
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
            resolve(MOCK_APIS[path].data);
          }, 300);
        });
      }
    }

    // 不拦截的请求使用原始方法处理
    return originalHttp.call(this, options);
  };
}
