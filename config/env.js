/**
 * 应用配置文件
 * 包含环境判断、加密配置和API配置
 * 支持开发和生产环境的不同配置
 */

// 判断当前环境
const isDevelopment = process.env.NODE_ENV === 'development'

// 加密配置
const ENCRYPTION_CONFIG = {
  // 加密密钥 (生产环境应该使用环境变量注入)
  APP_SECRET_KEY: isDevelopment 
    ? 'development-secret-key-32-chars-long' 
    : process.env.APP_SECRET_KEY || 'production-secret-key-32-chars-long',

  // 密钥长度要求
  KEY_MIN_LENGTH: 32,
  KEY_MAX_LENGTH: 64,

  // 加密选项
  ENCRYPTION_ITERATIONS: 10000,
  IV_LENGTH: 16
}

// API配置
const API_CONFIG = {
  BASE_URL: isDevelopment
    ? 'http://localhost:3000'
    : 'https://api.example.com',

  TIMEOUT: 15000,
  MAX_RETRIES: 3
}

// 配置验证
const validateConfig = () => {
  const { APP_SECRET_KEY, KEY_MIN_LENGTH, KEY_MAX_LENGTH } = ENCRYPTION_CONFIG
  
  if (APP_SECRET_KEY.length < KEY_MIN_LENGTH) {
    throw new Error(`Secret key must be at least ${KEY_MIN_LENGTH} characters`)
  }
  
  if (APP_SECRET_KEY.length > KEY_MAX_LENGTH) {
    throw new Error(`Secret key must not exceed ${KEY_MAX_LENGTH} characters`)
  }
}

// 执行配置验证
validateConfig()

// 导出完整配置对象
export const config = {
  isDevelopment,
  encryption: ENCRYPTION_CONFIG,
  api: API_CONFIG
}

// 为了向后兼容，继续导出单个配置项
export const {
  APP_SECRET_KEY,
  KEY_MIN_LENGTH,
  KEY_MAX_LENGTH,
  ENCRYPTION_ITERATIONS,
  IV_LENGTH
} = ENCRYPTION_CONFIG

export const {
  BASE_URL,
  TIMEOUT,
  MAX_RETRIES
} = API_CONFIG