
import CryptoJS from 'crypto-js'

// 加密配置常量
const KEY_MIN_LENGTH = 32
const KEY_MAX_LENGTH = 64 
const APP_SECRET_KEY = 'kP#9mN$vX5wQ@8sL4pH7yR*gF3dA9bCjE2tB6uY'

const validateKey = (key, {minLength = KEY_MIN_LENGTH, maxLength = KEY_MAX_LENGTH} = {}) => {
  if (!key || typeof key !== 'string') {
    throw new TypeError('Invalid encryption key: Key must be a non-empty string')
  }

  if (key.length < minLength || key.length > maxLength) {
    throw new RangeError(`Invalid key length: Key must be between ${minLength} and ${maxLength} characters`)
  }

  const validKeyPattern = /^[A-Za-z0-9+/=_\-@#$%^&*!]+$/
  if (!validKeyPattern.test(key)) {
    throw new Error('Invalid key format: Key contains invalid characters')
  }

  const hasUpperCase = /[A-Z]/.test(key)
  const hasLowerCase = /[a-z]/.test(key)
  const hasNumber = /\d/.test(key)
  const hasSpecialChar = /[+/=_\-@#$%^&*!]/.test(key)

  if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
    throw new Error('Invalid key strength: Key must contain uppercase, lowercase, numbers and special characters')
  }

  return true
}

const encrypt = (text, customKey = APP_SECRET_KEY) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Encryption error: Input must be a non-empty string')
  }
  try {
    validateKey(customKey)
    return CryptoJS.AES.encrypt(text, customKey).toString()
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

const decrypt = (ciphertext, customKey = APP_SECRET_KEY) => {
  if (!ciphertext || typeof ciphertext !== 'string') {
    throw new Error('Decryption error: Input must be a non-empty string')
  }
  try {
    validateKey(customKey)
    const bytes = CryptoJS.AES.decrypt(ciphertext, customKey)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) {
      throw new Error('Invalid decryption result')
    }
    return decrypted
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

const encryptData = (text, customKey = APP_SECRET_KEY) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Encryption error: Input must be a non-empty string')
  }
  try {
    validateKey(customKey)
    return encrypt(text, customKey)
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

// 解密数据
const decryptData = (ciphertext, customKey = APP_SECRET_KEY) => {
  // 如果密文为空或不是字符串，则抛出错误
  if (!ciphertext || typeof ciphertext !== 'string') {
    throw new Error('Decryption error: Input must be a non-empty string')
  }
  try {
    // 验证密钥
    validateKey(customKey)
    // 解密密文
    return decrypt(ciphertext, customKey)
  } catch (error) {
    // 如果解密失败，则抛出错误
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

const hashPassword = (password, salt = CryptoJS.lib.WordArray.random(128/8)) => {
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 512/32,
    iterations: 10000
  })
  return {
    hash: hash.toString(),
    salt: salt.toString()
  }
}

const verifyPassword = (password, hash, salt) => {
  const testHash = CryptoJS.PBKDF2(password, salt, {
    keySize: 512/32,
    iterations: 10000
  }).toString()
  return hash === testHash
}

const generateKey = (length = 32) => {
  return CryptoJS.lib.WordArray.random(length).toString()
}

const signMessage = (message, key) => {
  return CryptoJS.HmacSHA256(message, key).toString()
}

const verifySignature = (message, signature, key) => {
  const computedSignature = CryptoJS.HmacSHA256(message, key).toString()
  return computedSignature === signature
}

const secureStorage = {
  set: (key, value) => {
    if (!key || !value) {
      throw new Error('Storage error: Both key and value are required')
    }
    try {
      const encryptedValue = encrypt(JSON.stringify(value))
      uni.setStorageSync(key, encryptedValue)
    } catch (error) {
      throw new Error(`Failed to store data: ${error.message}`)
    }
  },

  get: (key) => {
    if (!key) {
      throw new Error('Storage error: Key is required')
    }
    try {
      const encryptedValue = uni.getStorageSync(key)
      if (!encryptedValue) return null

      const decryptedValue = decrypt(encryptedValue)
      return JSON.parse(decryptedValue)
    } catch (error) {
      console.error('Failed to retrieve storage value:', error)
      throw new Error('Data retrieval failed: Possible data corruption or invalid encryption key')
    }
  },

  remove: (key) => {
    if (!key) {
      throw new Error('Storage error: Key is required')
    }
    try {
      uni.removeStorageSync(key)
    } catch (error) {
      throw new Error(`Failed to remove data: ${error.message}`)
    }
  }
}

const maskSensitiveData = {
  phone: (phone) => {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },

  email: (email) => {
    const [name, domain] = email.split('@')
    return `${name.charAt(0)}***@${domain}`
  },

  idCard: (idCard) => {
    return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1****$2')
  }
}

const validateInitialConfig = () => {
  if (!KEY_MIN_LENGTH || !KEY_MAX_LENGTH || 
      typeof KEY_MIN_LENGTH !== 'number' || 
      typeof KEY_MAX_LENGTH !== 'number') {
    throw new Error('Configuration error: Invalid key length constants - must be valid numbers')
  }

  if (KEY_MIN_LENGTH > KEY_MAX_LENGTH) {
    throw new Error('Configuration error: KEY_MIN_LENGTH cannot be greater than KEY_MAX_LENGTH')
  }

  if (KEY_MIN_LENGTH < 16) {
    throw new Error('Security error: KEY_MIN_LENGTH must be at least 16 characters')
  }

  if (!APP_SECRET_KEY || typeof APP_SECRET_KEY !== 'string') {
    throw new Error('Configuration error: Invalid APP_SECRET_KEY - must be a non-empty string')
  }

  try {
    validateKey(APP_SECRET_KEY)
  } catch (error) {
    throw new Error(`Configuration error: Invalid APP_SECRET_KEY - ${error.message}`)
  }
}

// 验证初始配置
validateInitialConfig()

// 导出模块接口
export {
  validateKey,
  encrypt,
  decrypt,
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateKey,
  signMessage,
  verifySignature,
  secureStorage,
  maskSensitiveData
}
