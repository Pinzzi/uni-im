import { secureStorage, hashPassword, verifyPassword } from './crypto'
import request from './request'

// 登录尝试记录
const loginAttempts = {
  count: 0,
  lastAttempt: null,
  lockUntil: null
}

// 设备信息加密存储
export const storeDeviceInfo = () => {
  const deviceInfo = {
    platform: uni.getSystemInfoSync().platform,
    deviceId: uni.getSystemInfoSync().deviceId,
    deviceModel: uni.getSystemInfoSync().model,
    lastLoginTime: new Date().getTime()
  }
  secureStorage.set('deviceInfo', deviceInfo)
  return deviceInfo
}

// 验证设备合法性
export const verifyDevice = () => {
  const storedDevice = secureStorage.get('deviceInfo')
  if (!storedDevice) return false

  const currentDevice = uni.getSystemInfoSync()
  return storedDevice.deviceId === currentDevice.deviceId 
    && storedDevice.platform === currentDevice.platform
}

// 检查登录限制
export const checkLoginThrottle = () => {
  const now = new Date().getTime()

  // 如果被锁定，检查是否可以解锁
  if (loginAttempts.lockUntil && now < loginAttempts.lockUntil) {
    const remainingTime = Math.ceil((loginAttempts.lockUntil - now) / 1000)
    throw new Error(`账号已被锁定，请在${remainingTime}秒后重试`)
  }

  // 重置计数器（如果距离上次尝试超过30分钟）
  if (loginAttempts.lastAttempt && (now - loginAttempts.lastAttempt) > 30 * 60 * 1000) {
    loginAttempts.count = 0
  }

  // 更新尝试记录
  loginAttempts.lastAttempt = now
  loginAttempts.count++

  // 如果尝试次数过多，锁定账号
  if (loginAttempts.count >= 5) {
    loginAttempts.lockUntil = now + (15 * 60 * 1000) // 锁定15分钟
    throw new Error('登录尝试次数过多，账号已被锁定15分钟')
  }
}

// 安全的登录流程
export const secureLogin = async (username, password) => {
  try {
    // 检查登录限制
    checkLoginThrottle()

    // 验证设备
    if (!verifyDevice()) {
      // 如果是新设备，可以要求额外验证
      // TODO: 实现新设备验证逻辑（如发送验证码）
      storeDeviceInfo()
    }

    // 获取存储的密码哈希和盐（如果有）
    const storedAuth = secureStorage.get(`auth_${username}`)

    // 如果之前登录过，验证本地密码哈希
    if (storedAuth && !verifyPassword(password, storedAuth.hash, storedAuth.salt)) {
      throw new Error('密码错误')
    }

    // 调用登录接口
    const loginResult = await request({
      url: '/login',
      method: 'POST',
      data: {
        username,
        password,
        deviceInfo: uni.getSystemInfoSync()
      }
    })

    // 登录成功，重置尝试计数
    loginAttempts.count = 0
    loginAttempts.lockUntil = null

    // 存储新的密码哈希
    const { hash, salt } = hashPassword(password)
    secureStorage.set(`auth_${username}`, { hash, salt })

    // 安全存储登录信息
    const loginInfo = {
      ...loginResult,
      expireTime: new Date().getTime() + loginResult.refreshTokenExpiresIn * 1000
    }
    secureStorage.set('loginInfo', loginInfo)

    // 更新设备信息
    storeDeviceInfo()

    return loginInfo

  } catch (error) {
    // 登录失败，增加失败计数但不重置
    console.error('Login failed:', error)
    throw error
  }
}

// 安全登出
export const secureLogout = () => {
  // 清除所有敏感信息
  secureStorage.remove('loginInfo')
  // 保留设备信息，用于后续登录验证
  // secureStorage.remove('deviceInfo')

  // 清除其他可能的敏感数据
  uni.clearStorageSync()
}
