import { ImportOutlined, PlusOutlined, TranslationOutlined } from '@ant-design/icons'
import { App, Button, Table } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import type { AdminArticleQuery } from '../../types/api'
import { ArticleFilters } from '../components/articles/ArticleFilters'
import { BatchBar } from '../components/articles/BatchBar'
import { useArticleColumns } from '../components/articles/useArticleColumns'
import { PageHeader } from '../components/common/PageHeader'
import { QueryError } from '../components/common/QueryError'
import { useAdminArticles, useBackfillTranslations, useDeleteArticle } from '../hooks/useArticles'
import { useErrorToast } from '../hooks/useErrorToast'
import { useAdminCategories } from '../hooks/useTaxonomy'
import {
  buildArticleSearchParams,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  parseArticleQuery,
} from '../utils/articleQuery'
import styles from '../components/articles/articles.module.css'

/** 文章管理：服务端分页 + 筛选（状态写在 URL 里）+ 批量操作。 */
export default function ArticlesPage() {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseArticleQuery(searchParams), [searchParams])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deletingId, setDeletingId] = useState<number>()

  const articles = useAdminArticles(query)
  const categories = useAdminCategories()
  const deleteArticle = useDeleteArticle()
  const backfillTranslations = useBackfillTranslations()

  const startBackfill = async () => {
    try {
      const result = await backfillTranslations.mutateAsync()
      void message.success(t('articles.translation.result', { ...result }))
    } catch (error) {
      toastError(error)
    }
  }

  /**
   * 修改查询条件统一走这里：写回 URL，并清空选择。
   * 选择不跨页/跨筛选保留——否则管理员可能对“已经看不到”的文章做批量删除。
   */
  const applyQuery = useCallback(
    (next: AdminArticleQuery) => {
      setSelectedIds([])
      setSearchParams(buildArticleSearchParams(next))
    },
    [setSearchParams],
  )

  const onDelete = useCallback(
    async (id: number) => {
      setDeletingId(id)
      try {
        await deleteArticle.mutateAsync(id)
        void message.success(t('articles.deleted'))
        setSelectedIds((ids) => ids.filter((x) => x !== id))
      } catch (error) {
        toastError(error)
      } finally {
        setDeletingId(undefined)
      }
    },
    [deleteArticle, message, t, toastError],
  )

  const columns = useArticleColumns({ deletingId, onDelete })
  const { records = [], total = 0 } = articles.data ?? {}

  // 删光最后一页的最后一条后，当前页码超出范围、列表为空：退回到有数据的最后一页。
  // 用声明式的 <Navigate> 而不是在渲染里调用 applyQuery（会触发导航，渲染期间不能有副作用）
  const lastPage = Math.max(1, Math.ceil(total / (query.size ?? DEFAULT_PAGE_SIZE)))
  const pastEnd = Boolean(articles.data) && records.length === 0 && total > 0 && (query.page ?? 1) > lastPage
  if (pastEnd) {
    return <Navigate replace to={{ search: buildArticleSearchParams({ ...query, page: lastPage }).toString() }} />
  }

  return (
    <>
      <PageHeader
        title={t('articles.title')}
        subtitle={t('articles.subtitle')}
        extra={
          <>
            <Link to="/admin/import">
              <Button icon={<ImportOutlined />}>{t('nav.import')}</Button>
            </Link>
            <Button
              icon={<TranslationOutlined />}
              loading={backfillTranslations.isPending}
              onClick={() => void startBackfill()}
            >
              {t('articles.translation.backfill')}
            </Button>
            <Link to="/admin/articles/new">
              <Button type="primary" icon={<PlusOutlined />}>
                {t('articles.create')}
              </Button>
            </Link>
          </>
        }
      />
      <ArticleFilters
        query={query}
        categories={categories.data}
        onChange={(patch) => applyQuery({ ...query, ...patch, page: 1 })}
        onReset={() => applyQuery({ size: query.size, sort: query.sort })}
      />
      {selectedIds.length > 0 && (
        <BatchBar
          selectedIds={selectedIds}
          categories={categories.data}
          onDone={() => setSelectedIds([])}
          onClear={() => setSelectedIds([])}
        />
      )}
      {articles.isError ? (
        <QueryError error={articles.error} onRetry={() => void articles.refetch()} />
      ) : (
        <div className={styles.tableWrap}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={records}
            loading={articles.isFetching}
            scroll={{ x: 1000 }}
            rowClassName={(row) => (row.status === 'DRAFT' ? styles.draftRow : '')}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys.map(Number)),
            }}
            pagination={{
              current: query.page,
              pageSize: query.size,
              total,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (n) => t('articles.total', { count: n }),
              onChange: (page, size) => applyQuery({ ...query, page: size === query.size ? page : 1, size }),
            }}
          />
        </div>
      )}
    </>
  )
}
