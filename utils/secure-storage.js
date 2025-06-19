import { encryptSensitiveData, decryptSensitiveData, generateToken } from './crypto'
import securityConfig from '@/config/security'

/**
 * 数据脱敏规则
 */
const maskRules = {
  // 手机号码: 保留前3后4
  phone: (value) => {
    if (!value) return value
    return value.replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
  },

  // 邮箱: 部分隐藏用户名
  email: (value) => {
    if (!value) return value
    const [name, domain] = value.split('@')
    const maskedName = name.length > 2 
      ? `${name.slice(0, 2)}***${name.slice(-1)}`
      : `${name.slice(0, 1)}***`
    return `${maskedName}@${domain}`
  },

  // 身份证: 保留前6后4
  idCard: (value) => {
    if (!value) return value
    return value.replace(/^(\d{6})\d+(\d{4})$/, '$1********$2')
  },

  // 银行卡: 仅显示后4位
  bankCard: (value) => {
    if (!value) return value
    return value.replace(/\d(?=\d{4})/g, '*')
  },

  // 姓名: 仅显示姓
  name: (value) => {
    if (!value) return value
    return value.replace(/^([\u4e00-\u9fa5])([\u4e00-\u9fa5]+)$/, '$1**')
  },

  // 地址: 保留省市
  address: (value) => {
    if (!value) return value
    return value.replace(/^([^省]+省[^市]+市).*$/, '$1****')
  }
}

/**
 * 数据脱敏处理
 */
export const maskSensitiveData = (data, type) => {
  if (!data) return data

  const maskFunction = maskRules[type]
  if (!maskFunction) {
    console.warn(`未找到类型 ${type} 的脱敏规则`)
    return data
  }

  return maskFunction(data)
}

/**
 * 安全的本地存储类
 */
class SecureStorage {
  constructor() {
    this.sensitiveKeys = new Set(securityConfig.storage.sensitive.keys)
  }

  /**
   * 安全存储数据
   */
  setItem(key, value) {
    try {
      // 检查是否需要加密
      if (this.sensitiveKeys.has(key)) {
        value = encryptSensitiveData(value)
      }

      // 添加元数据
      const item = {
        value,
        timestamp: Date.now(),
        encrypted: this.sensitiveKeys.has(key)
      }

      uni.setStorageSync(key, JSON.stringify(item))
    } catch (error) {
      console.error('存储数据失败:', error)
      throw error
    }
  }

  /**
   * 安全读取数据
   */
  getItem(key) {
    try {
      const item = uni.getStorageSync(key)
      if (!item) return null

      const { value, timestamp, encrypted } = JSON.parse(item)

      // 检查数据是否过期
      if (this._isExpired(timestamp)) {
        this.removeItem(key)
        return null
      }

      // 解密数据
      return encrypted ? decryptSensitiveData(value) : value
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  /**
   * 删除数据
   */
  removeItem(key) {
    try {
      uni.removeStorageSync(key)
    } catch (error) {
      console.error('删除数据失败:', error)
      throw error
    }
  }

  /**
   * 清除所有数据
   */
  clear() {
    try {
      uni.clearStorageSync()
    } catch (error) {
      console.error('清除数据失败:', error)
      throw error
    }
  }

  /**
   * 检查数据是否过期
   */
  _isExpired(timestamp) {
    const now = Date.now()
    const maxAge = securityConfig.message.storage.retentionPeriod * 1000
    return (now - timestamp) > maxAge
  }
}

// 创建单例
export const secureStorage = new SecureStorage()

/**
 * 内存数据保护
 */
export class SecureMemoryStorage {
  constructor() {
    this._data = new Map()
    this._accessTokens = new Map()
  }

  /**
   * 存储数据
   */
  set(key, value) {
    const accessToken = generateToken()
    this._data.set(key, value)
    this._accessTokens.set(key, accessToken)
    return accessToken
  }

  /**
   * 读取数据
   */
  get(key, accessToken) {
    if (this._accessTokens.get(key) !== accessToken) {
      throw new Error('访问令牌无效')
    }
    return this._data.get(key)
  }

  /**
   * 删除数据
   */
  delete(key, accessToken) {
    if (this._accessTokens.get(key) !== accessToken) {
      throw new Error('访问令牌无效')
    }
    this._data.delete(key)
    this._accessTokens.delete(key)
  }

  /**
   * 清除所有数据
   */
  clear() {
    this._data.clear()
    this._accessTokens.clear()
  }
}

// 创建内存存储单例
export const secureMemory = new SecureMemoryStorage()

/**
 * 定期清理机制
 */
export const setupCleanupTask = () => {
  const cleanup = () => {
    try {
      const storage = uni.getStorageInfoSync()
      storage.keys.forEach(key => {
        const item = secureStorage.getItem(key)
        if (!item) {
          // 数据已过期，已在getItem中被删除
          return
        }
      })
    } catch (error) {
      console.error('清理任务执行失败:', error)
    }
  }

  // 每小时执行一次清理
  setInterval(cleanup, 3600000)
}
