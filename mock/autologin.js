// 自动登录模块
import { mockUser } from './user.js';
import { encryptData } from '../common/crypto.js';

// 模拟自动登录处理
export function setupAutoLogin() {
  // 检查是否已启用 Mock 模式
  const isMockEnabled = uni.getStorageSync('enableMock') || false;

  if (!isMockEnabled) {
    console.log('[MOCK] 自动登录未启用，请在设置中开启');
    return;
  }

  console.log('[MOCK] 正在执行自动登录...');

  try {
    // 准备模拟的登录信息
    const mockLoginInfo = {
      user: mockUser,
      token: mockUser.token,
      expires: Date.now() + 24 * 60 * 60 * 1000
    };

    // 加密存储模拟的登录信息（与实际登录流程保持一致）
    const encryptedLoginInfo = encryptData(JSON.stringify(mockLoginInfo));
    uni.setStorageSync('loginInfo', encryptedLoginInfo);
    uni.setStorageSync('lastLoginTime', Date.now());
    uni.setStorageSync('userName', mockUser.userName);

    console.log('[MOCK] 自动登录成功，已存储模拟用户数据');

    // 检查当前页面，如果在登录页则跳转到主页
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    if (currentPage && currentPage.route && currentPage.route.includes('login')) {
      console.log('[MOCK] 当前在登录页面，正在准备跳转到主页...');
      // 添加延迟，避免多次导航操作导致冲突
      setTimeout(() => {
        // 再次检查确保没有其他导航正在进行
        const currentPages = getCurrentPages();
        if(currentPages.length > 0 && currentPages[currentPages.length - 1].route.includes('login')) {
          console.log('[MOCK] 执行跳转到主页');
          uni.switchTab({
            url: "/pages/chat/chat",
            fail: (err) => {
              console.error('[MOCK] 页面导航失败:', err);
            }
          });
        } else {
          console.log('[MOCK] 跳转已由其他操作处理，不再重复执行');
        }
      }, 300);
    }

    return true;
  } catch (error) {
    console.error('[MOCK] 自动登录失败:', error);
    return false;
  }
}

// 提供切换 Mock 模式的方法
export function toggleMockMode(enable = true) {
  uni.setStorageSync('enableMock', enable);
  console.log(`[MOCK] ${enable ? '启用' : '禁用'}模拟登录模式`);

  if (enable) {
    // 立即执行自动登录
    const success = setupAutoLogin();
    return success;
  } else {
    // 清除登录信息
    uni.removeStorageSync('loginInfo');
    uni.removeStorageSync('lastLoginTime');
    console.log('[MOCK] 已清除登录信息');

    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({
        url: "/pages/login/login",
        fail: (err) => {
          console.error('[MOCK] 返回登录页失败:', err);
        }
      });
    }, 300);
    return true;
  }
}
