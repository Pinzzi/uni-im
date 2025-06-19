import CryptoJS from 'crypto-js'

/**
 * 生成设备指纹
 * 基于设备特征信息生成唯一标识
 */
export const deviceFingerprint = async () => {
  try {
    const systemInfo = uni.getSystemInfoSync()

    // 收集设备信息
    const deviceInfo = {
      platform: systemInfo.platform,
      model: systemInfo.model,
      brand: systemInfo.brand,
      system: systemInfo.system,
      devicePixelRatio: systemInfo.devicePixelRatio,
      language: systemInfo.language,
      SDKVersion: systemInfo.SDKVersion,
      windowWidth: systemInfo.windowWidth,
      windowHeight: systemInfo.windowHeight,
      timeZone: new Date().getTimezoneOffset()
    }

    // 获取网络信息
    const networkInfo = await getNetworkInfo()
    deviceInfo.networkType = networkInfo.networkType

    // 获取存储信息
    const storageInfo = uni.getStorageInfoSync()
    deviceInfo.storageSize = storageInfo.limitSize

    // 生成指纹
    const fingerprint = generateFingerprint(deviceInfo)

    return fingerprint
  } catch (error) {
    console.error('生成设备指纹失败:', error)
    return null
  }
}

/**
 * 获取网络信息
 */
const getNetworkInfo = () => {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => resolve(res),
      fail: () => resolve({ networkType: 'unknown' })
    })
  })
}

/**
 * 基于设备信息生成指纹
 */
const generateFingerprint = (deviceInfo) => {
  // 将设备信息转换为字符串
  const infoString = Object.entries(deviceInfo)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')

  // 使用SHA256生成指纹
  const fingerprint = CryptoJS.SHA256(infoString).toString()

  return fingerprint
}

/**
 * 验证设备指纹
 */
export const verifyDeviceFingerprint = async (storedFingerprint) => {
  const currentFingerprint = await deviceFingerprint()
  return currentFingerprint === storedFingerprint
}

/**
 * 获取设备基本信息
 */
export const getDeviceInfo = () => {
  try {
    const systemInfo = uni.getSystemInfoSync()

    return {
      platform: systemInfo.platform,
      model: systemInfo.model,
      brand: systemInfo.brand,
      system: systemInfo.system,
      language: systemInfo.language
    }
  } catch (error) {
    console.error('获取设备信息失败:', error)
    return null
  }
}

/**
 * 检查设备环境安全性
 */
export const checkDeviceSecurity = () => {
  const systemInfo = uni.getSystemInfoSync()

  // 检查是否越狱/root
  const isJailbroken = checkJailbreak(systemInfo)

  // 检查是否是模拟器
  const isEmulator = checkEmulator(systemInfo)

  return {
    isSecure: !isJailbroken && !isEmulator,
    isJailbroken,
    isEmulator,
    platform: systemInfo.platform
  }
}

/**
 * 检查是否越狱/root（基本检测）
 */
const checkJailbreak = (systemInfo) => {
  if (systemInfo.platform === 'ios') {
    // iOS 越狱检测
    return false // 需要实现具体的越狱检测逻辑
  } else if (systemInfo.platform === 'android') {
    // Android root检测
    return false // 需要实现具体的root检测逻辑
  }
  return false
}

/**
 * 检查是否是模拟器（基本检测）
 */
const checkEmulator = (systemInfo) => {
  const model = systemInfo.model.toLowerCase()
  const brand = systemInfo.brand.toLowerCase()

  // 检查常见模拟器特征
  const emulatorSigns = [
    'google_sdk',
    'droid4x',
    'simulator',
    'emulator',
    'android sdk built'
  ]

  return emulatorSigns.some(sign => 
    model.includes(sign) || brand.includes(sign)
  )
}
