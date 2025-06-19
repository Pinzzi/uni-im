/**
 * 配置验证器
 */

// 必需的配置项
const REQUIRED_FIELDS = {
    BASE_URL: 'string',
    WS_URL: 'string',
    ENABLE_ENCRYPTION: 'boolean',
    VALIDATE_RESPONSE: 'boolean'
}

// 条件必需的配置项
const CONDITIONAL_FIELDS = {
    ENCRYPT_KEY: (config) => config.ENABLE_ENCRYPTION,
    API_SECRET: (config) => config.VALIDATE_RESPONSE
}

// 配置项验证规则
const VALIDATION_RULES = {
    BASE_URL: (value) => {
        if (!value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('/')) {
            throw new Error('BASE_URL must start with http://, https:// or /')
        }
        return true
    },
    WS_URL: (value) => {
        if (!value.startsWith('ws://') && !value.startsWith('wss://')) {
            throw new Error('WS_URL must start with ws:// or wss://')
        }
        return true
    },
    RATE_LIMIT: (value) => {
        if (typeof value !== 'object') return false
        if (typeof value.MAX_REQUESTS !== 'number') return false
        if (typeof value.TIME_WINDOW !== 'number') return false
        return true
    },
    SECURITY_HEADERS: (value) => {
        if (typeof value !== 'object') return false
        return true
    }
}

/**
 * 验证配置类型
 */
function validateType(value, expectedType) {
    if (expectedType === 'boolean') {
        return typeof value === 'boolean'
    }
    if (expectedType === 'string') {
        return typeof value === 'string' && value.length > 0
    }
    if (expectedType === 'number') {
        return typeof value === 'number' && !isNaN(value)
    }
    if (expectedType === 'object') {
        return typeof value === 'object' && value !== null
    }
    return false
}

/**
 * 验证配置项
 */
function validateField(config, field, expectedType) {
    // 检查字段是否存在
    if (!(field in config)) {
        throw new Error(`Missing required field: ${field}`)
    }

    // 检查字段类型
    if (!validateType(config[field], expectedType)) {
        throw new Error(`Invalid type for ${field}: expected ${expectedType}, got ${typeof config[field]}`)
    }

    // 执行特定的验证规则
    if (VALIDATION_RULES[field]) {
        const isValid = VALIDATION_RULES[field](config[field])
        if (!isValid) {
            throw new Error(`Validation failed for ${field}`)
        }
    }
}

/**
 * 验证条件必需的配置项
 */
function validateConditionalFields(config) {
    for (const [field, condition] of Object.entries(CONDITIONAL_FIELDS)) {
        if (condition(config) && !config[field]) {
            throw new Error(`Missing required field ${field} based on configuration`)
        }
    }
}

/**
 * 验证安全配置
 */
function validateSecurityConfig(config) {
    // 验证加密配置
    if (config.ENABLE_ENCRYPTION) {
        if (!config.ENCRYPT_KEY || config.ENCRYPT_KEY.length < 16) {
            throw new Error('Invalid encryption key: must be at least 16 characters')
        }
    }

    // 验证API密钥
    if (config.VALIDATE_RESPONSE) {
        if (!config.API_SECRET || config.API_SECRET.length < 16) {
            throw new Error('Invalid API secret: must be at least 16 characters')
        }
    }

    // 验证限流配置
    if (config.RATE_LIMIT) {
        if (config.RATE_LIMIT.MAX_REQUESTS < 1) {
            throw new Error('Invalid rate limit: MAX_REQUESTS must be positive')
        }
        if (config.RATE_LIMIT.TIME_WINDOW < 1000) {
            throw new Error('Invalid rate limit: TIME_WINDOW must be at least 1000ms')
        }
    }
}

/**
 * 主验证函数
 */
export function validateConfig(config) {
    if (!config) {
        throw new Error('Configuration object is required')
    }

    // 验证必需字段
    for (const [field, expectedType] of Object.entries(REQUIRED_FIELDS)) {
        validateField(config, field, expectedType)
    }

    // 验证条件必需字段
    validateConditionalFields(config)

    // 验证安全配置
    validateSecurityConfig(config)

    // 生产环境特殊检查
    if (process.env.NODE_ENV === 'production') {
        // 强制启用加密
        if (!config.ENABLE_ENCRYPTION) {
            throw new Error('Encryption must be enabled in production')
        }

        // 强制使用HTTPS
        if (config.BASE_URL.startsWith('http://')) {
            throw new Error('HTTPS is required in production')
        }

        // 强制使用WSS
        if (config.WS_URL.startsWith('ws://')) {
            throw new Error('WSS is required in production')
        }
    }

    return true
}

/**
 * 获取配置验证错误的友好提示
 */
export function getConfigValidationError(error) {
    const errorMessages = {
        'Missing required field': '缺少必需的配置项',
        'Invalid type': '配置项类型错误',
        'Validation failed': '配置项验证失败',
        'Invalid encryption key': '加密密钥无效',
        'Invalid API secret': 'API密钥无效',
        'Invalid rate limit': '请求限制配置无效',
        'HTTPS is required': '生产环境必须使用HTTPS',
        'WSS is required': '生产环境必须使用WSS',
        'Encryption must be enabled': '生产环境必须启用加密'
    }

    for (const [key, message] of Object.entries(errorMessages)) {
        if (error.message.includes(key)) {
            return message + ': ' + error.message
        }
    }

    return '配置验证失败: ' + error.message
}
