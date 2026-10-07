import { DeleteOutlined, DownOutlined } from '@ant-design/icons'
import { Alert, App, Button, Dropdown } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../../../hooks/useLocalized'
import { ARTICLE_LEVELS, type ArticleBatchRequest, type CategoryView } from '../../../types/api'
import { useBatchDeleteArticles, useBatchPatchArticles } from '../../hooks/useArticles'
import { useErrorToast } from '../../hooks/useErrorToast'
import { errorMessage } from '../../utils/error'
import styles from './articles.module.css'

interface BatchBarProps {
  selectedIds: number[]
  categories: CategoryView[] | undefined
  /** 批量操作成功后调用（通常用来清空选择）。 */
  onDone: () => void
  onClear: () => void
}

interface Failure {
  /** 失败时的选择集合签名；选择变了，这条错误就不再适用，不应继续显示。 */
  forIds: string
  message: string
  publishing: boolean
}

/**
 * 行选择后的批量操作栏：发布 / 转草稿 / 设置等级 / 设置领域 / 删除。
 *
 * 批量发布要求每篇都已有领域，否则后端整批拒绝并返回具体原因（如“有 3 篇文章尚未设置领域”）。
 * 这类错误转瞬即逝的 toast 容易被错过，所以用常驻的 Alert 展示，直到用户改变选择或再次操作。
 */
export function BatchBar({ selectedIds, categories, onDone, onClear }: BatchBarProps) {
  const { t } = useTranslation('admin')
  const { message, modal } = App.useApp()
  const localized = useLocalizedName()
  const toastError = useErrorToast()
  const patch = useBatchPatchArticles()
  const remove = useBatchDeleteArticles()
  const [failure, setFailure] = useState<Failure | null>(null)

  const idsKey = selectedIds.join(',')
  const visibleFailure = failure && failure.forIds === idsKey ? failure : null
  const busy = patch.isPending || remove.isPending

  const apply = async (changes: Omit<ArticleBatchRequest, 'ids'>) => {
    setFailure(null)
    try {
      const result = await patch.mutateAsync({ ids: selectedIds, ...changes })
      void message.success(t('articles.batch.updated', { count: result.updated }))
      onDone()
    } catch (error) {
      setFailure({
        forIds: idsKey,
        message: errorMessage(error, t('common.operationFailed')),
        publishing: changes.status === 'PUBLISHED',
      })
    }
  }

  const confirmDelete = () =>
    modal.confirm({
      title: t('articles.batch.deleteTitle', { count: selectedIds.length }),
      content: t('articles.batch.deleteContent'),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const result = await remove.mutateAsync(selectedIds)
          void message.success(t('articles.batch.deleted', { count: result.deleted }))
          onDone()
        } catch (error) {
          toastError(error)
        }
      },
    })

  return (
    <div className={styles.batchBar} role="region" aria-label={t('articles.batch.label')}>
      <span className={styles.batchCount}>{t('articles.batch.selected', { count: selectedIds.length })}</span>
      <Button type="primary" disabled={busy} loading={patch.isPending} onClick={() => apply({ status: 'PUBLISHED' })}>
        {t('articles.batch.publish')}
      </Button>
      <Button disabled={busy} onClick={() => apply({ status: 'DRAFT' })}>
        {t('articles.batch.unpublish')}
      </Button>
      <Dropdown
        disabled={busy}
        menu={{
          items: ARTICLE_LEVELS.map((level) => ({ key: level, label: t(`level.${level}`) })),
          onClick: ({ key }) => apply({ level: ARTICLE_LEVELS.find((l) => l === key) }),
        }}
      >
        <Button disabled={busy}>
          {t('articles.batch.setLevel')} <DownOutlined />
        </Button>
      </Dropdown>
      <Dropdown
        disabled={busy || !categories?.length}
        menu={{
          items: categories?.map((c) => ({ key: String(c.id), label: localized(c) })),
          onClick: ({ key }) => apply({ categoryId: Number(key) }),
          style: { maxHeight: 320, overflowY: 'auto' },
        }}
      >
        <Button disabled={busy || !categories?.length}>
          {t('articles.batch.setCategory')} <DownOutlined />
        </Button>
      </Dropdown>
      <Button danger icon={<DeleteOutlined />} disabled={busy} onClick={confirmDelete}>
        {t('common.delete')}
      </Button>
      <Button type="link" disabled={busy} onClick={onClear}>
        {t('articles.batch.clear')}
      </Button>
      {visibleFailure && (
        <Alert
          className={styles.batchError}
          type="error"
          showIcon
          closable={{ onClose: () => setFailure(null) }}
          title={visibleFailure.message}
          description={visibleFailure.publishing ? t('articles.batch.publishHint') : undefined}
        />
      )}
    </div>
  )
}
