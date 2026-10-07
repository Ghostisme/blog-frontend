import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../hooks/useLocalized'
import type { ArticleListItem } from '../types/api'
import { formatDate } from '../utils/format'
import { levelStyle } from '../utils/level'
import styles from './ArticleCard.module.css'
import { CategoryIcon } from './CategoryIcon'
import { LevelBadge } from './LevelBadge'

const MAX_TAGS_ON_CARD = 3

/**
 * 文章卡片（列表 / 首页共用）。
 *
 * 整张卡片可点击，但做法是让标题里的链接用 ::after 撑满卡片（见 CSS），
 * 而不是把整个卡片包进 <a>：这样卡片里依然可以放其它交互元素，
 * 屏幕阅读器读到的也只是一条干净的标题链接，而不是把摘要、标签全部读成链接文字。
 */
export function ArticleCard({ article }: { article: ArticleListItem }) {
  const { t, i18n } = useTranslation()
  const localized = useLocalizedName()

  return (
    <article className={styles.card} style={levelStyle(article.level)}>
      {article.coverUrl && (
        <div className={styles.cover}>
          {/* no-referrer：不少图床按 Referer 防盗链，带了来源反而会被拒绝 */}
          <img src={article.coverUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.badges}>
          <LevelBadge level={article.level} />
          {article.category && (
            <span className={styles.category}>
              <CategoryIcon name={article.category.icon} />
              {localized(article.category)}
            </span>
          )}
        </div>

        <h3 className={styles.title}>
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {article.summary && <p className={styles.summary}>{article.summary}</p>}

        {article.tags.length > 0 && (
          <ul className={styles.tags}>
            {article.tags.slice(0, MAX_TAGS_ON_CARD).map((tag) => (
              <li key={tag.id}>#{localized(tag)}</li>
            ))}
          </ul>
        )}

        <div className={styles.meta}>
          <span>{formatDate(article.publishedAt, i18n.language)}</span>
          <span>
            <ClockCircleOutlined /> {t('common.minutesRead', { count: article.readingMinutes })}
          </span>
          <span>
            <EyeOutlined /> {article.viewCount}
          </span>
        </div>
      </div>
    </article>
  )
}
