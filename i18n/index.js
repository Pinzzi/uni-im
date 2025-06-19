import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import deDE from './locales/de-DE.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import esAR from './locales/es-AR.json';
import frFR from './locales/fr-FR.json';
import itIT from './locales/it-IT.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import msMY from './locales/ms-MY.json';
import ptBR from './locales/pt-BR.json';
import th from './locales/th.json';
import viVN from './locales/vi-VN.json';

// 语言资源
const messages = {
  'zh-CN': zhCN,
  'de-DE': deDE, // 德
  'en-US': enUS, // 英语
  'es-ES': esES, // 西班牙语
  'es-AR': esAR, // 阿根廷 - 西班牙语
  'fr-FR': frFR, // 法
  'it-IT': itIT, // 意
  'ja': ja, // 日
  'ko': ko, // 韩
  'ms-MY': msMY,  // 马来
  'pt-BR': ptBR, // 巴西
  'th': th, // 泰
  'vi-VN': viVN // 越南
}


// 获取持久化的语言设置
const getSavedLanguage = () => {
  try {
    // 1. 检查本地存储
    const savedLang = uni.getStorageSync('APP_LANG')
    if (savedLang && messages[savedLang]) return savedLang
    
    // 2. 获取系统语言
    const systemInfo = uni.getSystemInfoSync()
    let systemLang = systemInfo.language || 'zh-CN'
    
    // 处理平台差异（微信小程序返回 zh_CN 格式）
    systemLang = systemLang.replace('_', '-')
    
    // 3. 匹配支持的语言
    if (messages[systemLang]) return systemLang
    
    // 4. 匹配基础语言（zh-CN -> zh）
    const baseLang = systemLang.split('-')[0]
    const matchedLang = Object.keys(messages).find(lang => 
      lang.startsWith(baseLang)
    )
    
    return matchedLang || 'zh-CN'
  } catch (e) {
    console.error('Failed to get language:', e)
    return 'zh-CN'
  }
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // Vue 3 模式
  locale: getSavedLanguage(), // 当前语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages,
  warnHtmlMessage: false, // 关闭HTML警告
  globalInjection: true, // 必须设置为 true 才能使用 $t
  modifiers: {
    // 自定义修饰符：首字母大写
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
  }
})

// 安全翻译方法（防止key不存在）
i18n.global.safeT = (key, fallback = '') => {
  return i18n.global.te(key) ? i18n.global.t(key) : fallback || key
}

// 监听语言变化事件
const setupLocaleListeners = () => {
  // 标准uni事件
  if (typeof uni.onLocaleChange === 'function') {
    uni.onLocaleChange(handleLocaleChange)
  }
}

const handleLocaleChange = ({ locale }) => {
  try {
    if (messages[locale]) {
      i18n.global.locale.value = locale
      uni.setStorageSync('APP_LANG', locale)
    } else {
      console.warn(`Unsupported locale: ${locale}`)
    }
  } catch (e) {
    console.error('Locale change error:', e)
  }
}

// 设置语言方法
export const setLocale = (lang) => {
  if (messages[lang]) {
    // 触发平台语言变更事件
    if (uni.setLocale) {
      uni.setLocale(lang)
    } else {
      handleLocaleChange({ locale: lang })
    }
  }
}

// 初始化语言监听
setupLocaleListeners()

// 安装方法（用于main.js）
export const installI18n = (app) => {
  app.use(i18n)
  
  // 扩展uni对象
  uni.$t = i18n.global.t
  uni.$safeT = i18n.global.safeT
}

export default i18n