import type { CSSProperties } from 'react'
import type { ArticleLevel } from '../types/api'

/** 等级 → 色值变量（定义见 styles/global.css，入门到资深由绿、蓝、紫到金）。 */
const LEVEL_COLOR_VAR: Record<ArticleLevel, string> = {
  BEGINNER: 'var(--level-beginner)',
  INTERMEDIATE: 'var(--level-intermediate)',
  ADVANCED: 'var(--level-advanced)',
  EXPERT: 'var(--level-expert)',
}

/**
 * 生成只设置 --c 的内联样式，让组件样式里统一用 var(--c) 引用“当前等级的颜色”。
 * 这样同一套 CSS 可以服务四个等级，不必为每个等级各写一遍选择器。
 */
export function levelStyle(level: ArticleLevel): CSSProperties {
  return { '--c': LEVEL_COLOR_VAR[level] } as CSSProperties
}
