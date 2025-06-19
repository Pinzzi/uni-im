//设置环境(打包前修改此变量)
const ENV = "DEV";

const DEFAULT_CONFIG = {
    BASE_URL: "http://127.0.0.1:8888",
    WS_URL: "ws://127.0.0.1:8878/im",
    ENABLE_ENCRYPTION: false,
    CRYPTO_KEY: "dev-key-123",
    TOKEN_EXPIRE: 86400,
    MAX_LOGIN_ATTEMPTS: 999,
    PASSWORD_MIN_LENGTH: 8,
    CORS_ORIGINS: ["*"],
    SSL: {
        ENABLED: false,
        CERT_PATH: "",
        KEY_PATH: ""
    }
}

const PROD_CONFIG = {
    BASE_URL: "https://www.im.online/api",
    WS_URL: "wss://www.im.online:81/im",
    ENABLE_ENCRYPTION: true,
    CRYPTO_KEY: "your-production-key",
    TOKEN_EXPIRE: 3600,
    MAX_LOGIN_ATTEMPTS: 5,
    CORS_ORIGINS: ["https://www.im.online"],
    SSL: {
        ENABLED: true,
        CERT_PATH: "/path/to/cert",
        KEY_PATH: "/path/to/key"
    }
}

const CONFIG = ENV === "PROD" ? PROD_CONFIG : DEFAULT_CONFIG;

// H5 环境特殊处理
// #ifdef H5
if (ENV === "DEV") {
    CONFIG.BASE_URL = "/api";
}
// #endif

const UNI_APP = {
    ...CONFIG,
    // 保持向后兼容
    SECURITY: {
        ENABLE_ENCRYPTION: CONFIG.ENABLE_ENCRYPTION,
        TOKEN_EXPIRE: CONFIG.TOKEN_EXPIRE,
        MAX_LOGIN_ATTEMPTS: CONFIG.MAX_LOGIN_ATTEMPTS,
        PASSWORD_MIN_LENGTH: CONFIG.PASSWORD_MIN_LENGTH,
        CORS_ORIGINS: CONFIG.CORS_ORIGINS,
        SSL: CONFIG.SSL
    }
}

export default UNI_APP