import { ArrowLeftOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Result, Skeleton } from 'antd'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useArticle } from '../api/queries'
import { CategoryIcon } from '../components/CategoryIcon'
import { ErrorState } from '../components/ErrorState'
import { LevelBadge } from '../components/LevelBadge'
import { ReadingProgress } from '../components/ReadingProgress'
import { TableOfContents, type TocHeading } from '../components/TableOfContents'
import { SITE } from '../config/site'
import { useLocalizedName } from '../hooks/useLocalized'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ArticleDetail as Article, ArticleNav } from '../types/api'
import { formatDate } from '../utils/format'
import { levelStyle } from '../utils/level'
import styles from './ArticleDetail.module.css'

// Markdown 渲染器连同语法高亮体积较大，只在打开文章时才下载
const Markdown = lazy(() => import('../components/Markdown'))

/** 从渲染结果里收集 h2/h3 作为目录。id 由 rehype-slug 生成，直接读 DOM 保证与锚点一致。 */
function collectHeadings(root: HTMLElement): TocHeading[] {
  return Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]')).map((el) => ({
    id: el.id,
    text: el.textContent ?? '',
    level: el.tagName === 'H2' ? 2 : 3,
  }))
}

export default function ArticleDetail() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const { data: article, error, isPending, refetch } = useArticle(slug)

  if (isPending) {
    return <div className="container" style={{ padding: '48px 0' }}><Skeleton active paragraph={{ rows: 10 }} /></div>
  }
  if (error) {
    return error instanceof ApiError && error.status === 404 ? (
      <Result
        status="404"
        title={t('article.notFound')}
        extra={<Link to="/articles"><Button type="primary">{t('article.backToList')}</Button></Link>}
      />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    )
  }
  return <ArticleView article={article} />
}

function ArticleView({ article }: { article: Article }) {
  const { t, i18n } = useTranslation()
  const localized = useLocalizedName()
  const bodyRef = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<TocHeading[]>([])
  usePageMeta(`${article.title} · ${SITE.name}`, article.summary)

  // 必须稳定：Markdown 的 effect 依赖它，每次渲染都换新函数会让它反复触发
  const onRendered = useCallback((root: HTMLElement) => setHeadings(collectHeadings(root)), [])

  // 打开带 #章节 的分享链接时，正文是懒加载 + 异步渲染的，浏览器加载完页面那一刻标题还不存在，
  // 原生的锚点跳转会落空。等标题收集完（说明正文已渲染）再补跳一次。
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id && headings.length > 0) {
      document.getElementById(id)?.scrollIntoView()
    }
  }, [headings])

  return (
    <div className={`container ${styles.page}`} style={levelStyle(article.level)}>
      <ReadingProgress target={bodyRef} />

      <div className={styles.layout}>
        <article>
          <Link to="/articles" className={styles.back}>
            <ArrowLeftOutlined /> {t('article.backToList')}
          </Link>

          <header>
            <div className={styles.badges}>
              <LevelBadge level={article.level} />
              {article.category && (
                <Link to={`/articles?category=${article.category.id}`} className={styles.category}>
                  <CategoryIcon name={article.category.icon} /> {localized(article.category)}
                </Link>
              )}
            </div>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.meta}>
              <span>{t('article.publishedAt')} {formatDate(article.publishedAt, i18n.language)}</span>
              {article.updatedAt !== article.publishedAt && (
                <span>{t('article.updatedAt')} {formatDate(article.updatedAt, i18n.language)}</span>
              )}
              <span><ClockCircleOutlined /> {t('common.minutesRead', { count: article.readingMinutes })}</span>
              <span><EyeOutlined /> {t('common.views', { count: article.viewCount })}</span>
            </div>
            {article.tags.length > 0 && (
              <div className={styles.tags}>
                {article.tags.map((tag) => (
                  <Link key={tag.id} to={`/articles?tag=${tag.id}`}>#{localized(tag)}</Link>
                ))}
              </div>
            )}
            {article.summary && <p className={styles.lead}>{article.summary}</p>}
            <SourceNotice article={article} />
          </header>

          <div ref={bodyRef} className={styles.content}>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 12 }} />}>
              <Markdown content={article.content} onRendered={onRendered} />
            </Suspense>
          </div>

          <nav className={styles.nav} aria-label="Article navigation">
            <NavCard item={article.older} label={t('article.older')} />
            <NavCard item={article.newer} label={t('article.newer')} end />
          </nav>
        </article>

        <aside className={styles.aside}>
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  )
}

/** 转载声明：有来源信息时显示作者署名和原文链接。这些文章是别人写的，署名和原文入口必须保留。 */
function SourceNotice({ article }: { article: Article }) {
  const { t } = useTranslation()
  if (!article.sourceUrl && !article.sourceAuthor) {
    return null
  }
  return (
    <div className={styles.source}>
      <strong>{t('article.reprintTitle')}</strong>
      {article.sourceAuthor && <span>{t('article.reprintAuthor', { author: article.sourceAuthor })}</span>}
      {article.sourceUrl && (
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
          {t('article.reprintLink')} ↗
        </a>
      )}
      <small>{t('article.reprintNote')}</small>
    </div>
  )
}

function NavCard({ item, label, end }: { item: ArticleNav | null; label: string; end?: boolean }) {
  const { t } = useTranslation()
  const cls = `${styles.navItem} ${end ? styles.navEnd : ''}`
  if (!item) {
    return (
      <div className={`${cls} ${styles.navMuted}`}>
        <small>{label}</small>
        <span>{t('article.noMore')}</span>
      </div>
    )
  }
  return (
    <Link to={`/articles/${item.slug}`} className={cls}>
      <small>{label}</small>
      <span>{item.title}</span>
    </Link>
  )
}
