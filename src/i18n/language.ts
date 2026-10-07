/** 界面支持的语言。新增语言需同时补 locales、antd locale（见 theme/ThemeProvider）和简历语言映射。 */
export type AppLanguage = 'zh-CN' | 'en-US'

export const LANGUAGE_STORAGE_KEY = 'blog.lang'

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'zh-CN' || value === 'en-US'
}

/**
 * 决定初始界面语言：用户上次手动选择的优先；没有选择过就看浏览器语言，
 * 任何中文变体（zh-TW、zh-HK …）都归到简体中文，其余一律英文。
 *
 * 写成纯函数、把 localStorage 与 navigator 的读取结果作为参数传入，是为了能脱离浏览器做单元测试。
 */
export function resolveLanguage(stored: string | null, navigatorLanguage: string | undefined): AppLanguage {
  if (isAppLanguage(stored)) {
    return stored
  }
  return navigatorLanguage?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

/** 界面语言 → 简历语言。简历只有中/英两份，与界面语言一一对应。 */
export function toResumeLang(language: string): 'zh' | 'en' {
  return language.startsWith('zh') ? 'zh' : 'en'
}
