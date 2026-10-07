import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ArticleLevel, ArticleStatus } from '../../../types/api'

/**
 * 文章状态标签。草稿用实心橙色而不是淡色：导入后的主要工作就是在列表里把草稿挑出来校正，
 * 必须一眼能扫到。
 */
export function StatusTag({ status }: { status: ArticleStatus }) {
  const { t } = useTranslation('admin')
  return status === 'PUBLISHED' ? (
    <Tag color="success" variant="filled">
      {t('status.PUBLISHED')}
    </Tag>
  ) : (
    <Tag color="warning" variant="solid">
      {t('status.DRAFT')}
    </Tag>
  )
}

/** antd 预设色名，深浅色下都有合适的对比度；由浅入深对应入门 → 资深，与前台的难度配色一致。 */
const LEVEL_COLOR: Record<ArticleLevel, string> = {
  BEGINNER: 'green',
  INTERMEDIATE: 'blue',
  ADVANCED: 'purple',
  EXPERT: 'orange',
}

export function LevelTag({ level }: { level: ArticleLevel }) {
  const { t } = useTranslation('admin')
  return <Tag color={LEVEL_COLOR[level]}>{t(`level.${level}`)}</Tag>
}
