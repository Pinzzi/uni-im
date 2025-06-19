// 安全配置文件
export default {
  // 加密相关
  crypto: {
    // AES 加密配置
    aes: {
      keySize: 256,
      iterations: 10000,
      // 密钥在生产环境应该通过安全的方式获取和存储
      // 这里的密钥仅用于开发环境
      key: process.env.NODE_ENV === 'production' 
        ? process.env.CRYPTO_KEY 
        : 'development-key-please-change-in-production'
    },

    // 消息签名配置
    signature: {
      algorithm: 'sha256',
      // 签名密钥应在生产环境安全存储
      key: process.env.NODE_ENV === 'production'
        ? process.env.SIGNATURE_KEY
        : 'development-signature-key'
    }
  },

  // WebSocket 安全配置
  websocket: {
    // 强制使用WSS
    forceSSL: true,
    // 心跳配置
    heartbeat: {
      interval: 10000,
      timeout: 5000
    },
    // 重连策略
    reconnect: {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000
    },
    // 消息有效期（毫秒）
    messageExpiration: 300000
  },

  // 认证安全配置
  auth: {
    // Token 配置
    token: {
      accessTokenExpiration: 7200, // 2小时
      refreshTokenExpiration: 604800, // 7天
      renewThreshold: 300 // 5分钟内过期就更新
    },

    // 登录安全
    login: {
      maxAttempts: 5, // 最大尝试次数
      lockoutDuration: 900000, // 15分钟
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSpecialChars: true
      }
    },

    // 设备认证
    device: {
      enabled: true,
      verificationRequired: true,
      maxDevices: 3,
      verificationExpiration: 300000 // 5分钟
    }
  },

  // 数据安全配置
  storage: {
    // 本地存储加密
    local: {
      enabled: true,
      algorithm: 'aes-256-gcm'
    },

    // 敏感数据配置
    sensitive: {
      // 需要加密的数据键名
      keys: [
        'loginInfo',
        'userProfile',
        'messages'
      ],
      // 需要脱敏的数据类型
      mask: {
        phone: true,
        email: true,
        idCard: true
      }
    }
  },

  // API安全配置
  api: {
    // 强制HTTPS
    forceHTTPS: true,

    // 请求限流
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 60000 // 1分钟
    },

    // 响应安全头
    securityHeaders: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },

  // 消息安全配置
  message: {
    // 端到端加密
    e2e: {
      enabled: true,
      algorithm: 'rsa-2048'
    },

    // 消息完整性
    integrity: {
      signMessages: true,
      verifySignatures: true
    },

    // 消息存储
    storage: {
      encryptAtRest: true,
      retentionPeriod: 2592000 // 30天
    }
  }
}
