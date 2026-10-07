import type { ReactNode } from 'react'
import styles from './common.module.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** 右侧操作区（新增按钮等）。窄屏下会换到标题下方。 */
  extra?: ReactNode
}

/** 后台页面统一的标题栏：保证各页标题层级、间距一致。 */
export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {extra && <div className={styles.pageExtra}>{extra}</div>}
    </div>
  )
}
