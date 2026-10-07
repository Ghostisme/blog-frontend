import { Button, Result, Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { QueryError } from '../components/common/QueryError'
import { ArticleEditor } from '../components/editor/ArticleEditor'
import { useAdminArticle } from '../hooks/useArticles'
import { isApiStatus } from '../utils/error'

/** 路由参数 → 文章 id；不是正整数（如 /articles/abc）返回 undefined。 */
function parseId(raw: string): number | undefined {
  const id = /^\d+$/.test(raw) ? Number(raw) : NaN
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

function NotFound() {
  const { t } = useTranslation('admin')
  return (
    <Result
      status="404"
      title={t('editor.notFound')}
      extra={
        <Link to="/admin/articles">
          <Button type="primary">{t('editor.backToList')}</Button>
        </Link>
      }
    />
  )
}

/**
 * 文章编辑页的路由入口：负责解析 id、加载数据与各种状态；
 * 真正的表单在 <ArticleEditor>，并以文章 id 为 key——换一篇文章时整个表单（含未提交的状态）干净重建。
 */
export default function ArticleEditPage() {
  const { id: idParam } = useParams()
  const isNew = idParam === undefined
  const id = idParam === undefined ? undefined : parseId(idParam)
  const article = useAdminArticle(id)

  if (isNew) {
    return <ArticleEditor key="new" />
  }
  if (id === undefined) {
    return <NotFound />
  }
  if (article.isPending) {
    return <Skeleton active paragraph={{ rows: 12 }} />
  }
  if (article.isError) {
    return isApiStatus(article.error, 404) ? (
      <NotFound />
    ) : (
      <QueryError error={article.error} onRetry={() => void article.refetch()} />
    )
  }
  return <ArticleEditor key={id} article={article.data} />
}
