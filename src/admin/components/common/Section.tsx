import type { ReactNode } from 'react'
import styles from './common.module.css'

interface SectionProps {
  title?: string
  children: ReactNode
  /** 标题右侧的附加内容（如“添加”按钮）。 */
  extra?: ReactNode
}

/** 表单/页面里的分组卡片。比 antd Card 更轻，并直接使用站点 CSS 变量，深浅色一致。 */
export function Section({ title, extra, children }: SectionProps) {
  return (
    <section className={styles.section}>
      {(title || extra) && (
        <div className={styles.sectionHead}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {extra}
        </div>
      )}
      {children}
    </section>
  )
}
