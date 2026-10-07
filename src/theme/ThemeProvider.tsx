import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { THEME_STORAGE_KEY, ThemeContext, type ThemeMode } from './ThemeContext'

/** 主色与 styles/global.css 里的 --color-primary 保持一致。 */
const PRIMARY = '#6366f1'

/** 首帧由 index.html 的内联脚本写到 <html data-theme>，这里直接读它，保证与首屏一致。 */
function initialMode(): ThemeMode {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/**
 * 主题 + Ant Design 全局配置。
 *
 * 同时负责 antd 组件库的语言包：antd 内置文案（分页、空状态、日期选择等）
 * 需要跟随界面语言切换，否则中文站里会冒出英文的 "Next Page"。
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    // 让浏览器原生控件（滚动条、表单控件）也跟随深浅色
    document.documentElement.style.colorScheme = mode
  }, [mode])

  const isZh = i18n.language.startsWith('zh')
  useEffect(() => {
    dayjs.locale(isZh ? 'zh-cn' : 'en')
  }, [isZh])

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        // 存不下就只在本次会话生效
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle])

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        locale={isZh ? zhCN : enUS}
        theme={{
          algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: PRIMARY,
            borderRadius: 10,
            fontFamily: 'var(--font-sans)',
            // 让 antd 自己的背景色与站点背景一致，避免卡片/输入框和页面底色出现色差
            colorBgLayout: mode === 'dark' ? '#0b0d14' : '#f6f7fb',
          },
          components: {
            Button: { controlHeight: 38, fontWeight: 500 },
            Tag: { borderRadiusSM: 6 },
          },
        }}
      >
        {/* AntdApp 提供 message / modal / notification 的上下文，后台页面用 App.useApp() 调用 */}
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
