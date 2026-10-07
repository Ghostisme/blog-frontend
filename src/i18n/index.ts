import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY, resolveLanguage, type AppLanguage } from './language'
import { enUS } from './locales/en-US'
import { zhCN } from './locales/zh-CN'

function readStoredLanguage(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY)
  } catch {
    // 隐私模式等场景下访问 localStorage 会抛异常；读不到就当作没有选择过
    return null
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'en-US': { translation: enUS },
  },
  lng: resolveLanguage(readStoredLanguage(), navigator.language),
  fallbackLng: 'zh-CN',
  // React 本身会转义输出，再转义一次会让 & 之类的字符显示成实体
  interpolation: { escapeValue: false },
})

// 同步 <html lang>：影响屏幕阅读器发音、浏览器翻译提示和 CSS :lang()
document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

/** 切换界面语言并记住选择。 */
export function changeLanguage(language: AppLanguage): void {
  void i18n.changeLanguage(language)
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // 存不下就只在本次会话生效，不影响使用
  }
}

export default i18n
