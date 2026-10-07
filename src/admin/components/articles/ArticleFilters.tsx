import { Button, Input, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../../../hooks/useLocalized'
import { ARTICLE_LEVELS, type AdminArticleQuery, type ArticleSort, type CategoryView } from '../../../types/api'
import { hasActiveFilters } from '../../utils/articleQuery'
import styles from './articles.module.css'

interface ArticleFiltersProps {
  query: AdminArticleQuery
  categories: CategoryView[] | undefined
  /** 只传变化的项；页码重置由调用方统一处理。 */
  onChange: (patch: Partial<AdminArticleQuery>) => void
  onReset: () => void
}

const SORTS: readonly ArticleSort[] = ['UPDATED', 'LATEST', 'HOT']

/** 文章列表筛选栏：状态、等级、领域、关键词与排序。筛选值由 URL 驱动，本组件无内部状态。 */
export function ArticleFilters({ query, categories, onChange, onReset }: ArticleFiltersProps) {
  const { t } = useTranslation('admin')
  const localized = useLocalizedName()

  return (
    <div className={styles.filters} role="search">
      <Select
        className={styles.filterItem}
        aria-label={t('articles.filterStatus')}
        placeholder={t('articles.filterStatus')}
        allowClear
        value={query.status}
        onChange={(status) => onChange({ status })}
        options={[
          { value: 'DRAFT', label: t('status.DRAFT') },
          { value: 'PUBLISHED', label: t('status.PUBLISHED') },
        ]}
      />
      <Select
        className={styles.filterItem}
        aria-label={t('articles.filterLevel')}
        placeholder={t('articles.filterLevel')}
        allowClear
        value={query.level}
        onChange={(level) => onChange({ level })}
        options={ARTICLE_LEVELS.map((level) => ({ value: level, label: t(`level.${level}`) }))}
      />
      <Select
        className={styles.filterItem}
        aria-label={t('articles.filterCategory')}
        placeholder={t('articles.filterCategory')}
        allowClear
        showSearch={{ optionFilterProp: 'label' }}
        loading={!categories}
        value={query.categoryId}
        onChange={(categoryId) => onChange({ categoryId })}
        options={categories?.map((c) => ({ value: c.id, label: localized(c) }))}
      />
      {/* key 绑定当前关键词：外部“清除筛选”后输入框内容随之重置，而不是残留旧文字 */}
      <Input.Search
        key={query.keyword ?? ''}
        className={styles.search}
        aria-label={t('articles.searchLabel')}
        placeholder={t('articles.searchPlaceholder')}
        allowClear
        maxLength={100}
        defaultValue={query.keyword}
        onSearch={(value) => onChange({ keyword: value.trim() || undefined })}
      />
      <Select
        className={styles.filterItem}
        aria-label={t('articles.sortLabel')}
        value={query.sort}
        onChange={(sort) => onChange({ sort })}
        options={SORTS.map((sort) => ({ value: sort, label: t(`articles.sort.${sort}`) }))}
      />
      {hasActiveFilters(query) && <Button onClick={onReset}>{t('articles.clearFilters')}</Button>}
    </div>
  )
}
