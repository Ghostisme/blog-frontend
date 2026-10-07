import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
  mode: ThemeMode
  toggle: () => void
}

export const THEME_STORAGE_KEY = 'blog.theme'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * 读取当前主题。单独放在 Context 文件而不是和 Provider 同文件：
 * 组件文件若同时导出 Hook，会破坏 React Fast Refresh（lint 规则 only-export-components）。
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用')
  }
  return ctx
}
