import { Button, Empty, Pagination, Skeleton } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useArticles, useFilters } from '../api/queries'
import { ArticleCard } from '../components/ArticleCard'
import { ErrorState } from '../components/ErrorState'
import { FilterBar } from '../components/FilterBar'
import { SITE } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  hasActiveFilters,
  PAGE_SIZE,
  parseFilters,
  toQuery,
  toSearchParams,
  type FilterState,
} from '../utils/articleFilters'
import styles from './Articles.module.css'

/**
 * 文章列表页。筛选状态完整地存在 URL 里（见 utils/articleFilters）：
 * 刷新、前进后退、分享链接都能还原同一个结果。
 */
export default function Articles() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const state = useMemo(() => parseFilters(params), [params])
  usePageMeta(`${t('articles.title')} · ${SITE.name}`)

  const filters = useFilters()
  const articles = useArticles(toQuery(state))

  /** 任何筛选条件变化都回到第 1 页：停留在第 5 页却只剩 2 页结果会显示空白。翻页本身例外。 */
  const update = (patch: Partial<FilterState>) => {
    const next = { ...state, page: 1, ...patch }
    setParams(toSearchParams(next))
  }

  const clearAll = () => setParams(new URLSearchParams())

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>{t('articles.title')}</h1>
        <p>{t('articles.subtitle')}</p>
      </header>

      <FilterBar state={state} options={filters.data} onChange={update} />

      {articles.isError ? (
        <ErrorState error={articles.error} onRetry={() => void articles.refetch()} />
      ) : articles.isPending ? (
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 32 }} />
      ) : (
        <>
          <div className={styles.summary}>
            <span>{t('articles.total', { count: articles.data.total })}</span>
            {hasActiveFilters(state) && (
              <Button type="link" size="small" onClick={clearAll}>{t('articles.clearFilters')}</Button>
            )}
          </div>

          {articles.data.records.length === 0 ? (
            <Empty description={<><strong>{t('articles.noResult')}</strong><br />{t('articles.noResultHint')}</>} />
          ) : (
            <div className={styles.grid} data-stale={articles.isPlaceholderData}>
              {articles.data.records.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}

          {articles.data.total > PAGE_SIZE && (
            <div className={styles.pager}>
              <Pagination
                current={state.page}
                pageSize={PAGE_SIZE}
                total={articles.data.total}
                showSizeChanger={false}
                onChange={(page) => setParams(toSearchParams({ ...state, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
