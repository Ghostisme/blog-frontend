import { useTranslation } from 'react-i18next'
import { ARTICLE_LEVELS, type ArticleLevel } from '../types/api'
import { levelStyle } from '../utils/level'
import styles from './LevelBadge.module.css'

/**
 * 难度徽标：信号格 + 名称。
 * 用“点亮几格”表达由浅入深，比单靠颜色更直观，也让色觉障碍的读者能区分等级。
 */
export function LevelBadge({ level }: { level: ArticleLevel }) {
  const { t } = useTranslation()
  const filled = ARTICLE_LEVELS.indexOf(level) + 1

  return (
    <span className={styles.badge} style={levelStyle(level)}>
      <span className={styles.bars} aria-hidden="true">
        {ARTICLE_LEVELS.map((l, i) => (
          <i key={l} className={i < filled ? styles.on : undefined} />
        ))}
      </span>
      {t(`level.${level}.name`)}
    </span>
  )
}
