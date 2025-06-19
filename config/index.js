/**
 * 配置文件入口
 * 统一导出所有配置项
 */

import { config as envConfig } from './env'

// 导出配置
export default {
  ...envConfig,

  // 在这里可以添加其他配置模块
  // 例如：主题配置、应用配置等
}

// 配置验证
const validateConfig = () => {
  if (!envConfig || typeof envConfig !== 'object') {
    throw new Error('Invalid environment configuration')
  }

  if (!envConfig.encryption || typeof envConfig.encryption !== 'object') {
    throw new Error('Invalid encryption configuration')
  }

  if (!envConfig.api || typeof envConfig.api !== 'object') {
    throw new Error('Invalid API configuration')
  }
}

// 执行配置验证
validateConfig()
