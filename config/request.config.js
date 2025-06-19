import UNI_APP from '../.env.js'

export default {
    // 基础配置
    BASE_URL: UNI_APP.BASE_URL,
    WS_URL: UNI_APP.WS_URL,

    // 加密配置
    ENABLE_ENCRYPTION: UNI_APP.ENABLE_ENCRYPTION,
    ENCRYPT_KEY: UNI_APP.CRYPTO_KEY,
    API_SECRET: UNI_APP.CRYPTO_KEY, // 使用相同的密钥用于API签名

    // 验证配置
    VALIDATE_RESPONSE: true,

    // 请求配置
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,

    // 限流配置
    RATE_LIMIT: {
        MAX_REQUESTS: UNI_APP.MAX_LOGIN_ATTEMPTS || 100,
        TIME_WINDOW: 60000
    },

    // 安全头
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
}