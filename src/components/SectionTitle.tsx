import type { ReactNode } from 'react'
import styles from './SectionTitle.module.css'

interface SectionTitleProps {
  title: string
  subtitle?: string
  /** 右侧操作区，如“查看全部”链接 */
  extra?: ReactNode
}

/** 首页各区块的标题栏：主标题 + 副标题 + 右侧操作。 */
export function SectionTitle({ title, subtitle, extra }: SectionTitleProps) {
  return (
    <div className={styles.wrap}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {extra}
    </div>
  )
}
