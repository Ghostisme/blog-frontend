import { PlusOutlined } from '@ant-design/icons'
import { Alert, App, Button, Table } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryView } from '../../types/api'
import { PageHeader } from '../components/common/PageHeader'
import { QueryError } from '../components/common/QueryError'
import { CategoryFormModal } from '../components/taxonomy/CategoryFormModal'
import { useCategoryColumns } from '../components/taxonomy/useCategoryColumns'
import { useErrorToast } from '../hooks/useErrorToast'
import { useAdminCategories, useDeleteCategory } from '../hooks/useTaxonomy'
import articleStyles from '../components/articles/articles.module.css'

interface ModalState {
  /** 每次打开自增，作为弹窗的 key 使表单整体重建。 */
  seq: number
  open: boolean
  category?: CategoryView
}

/** 领域管理：表格 + 新增/编辑弹窗 + 删除。 */
export default function CategoriesPage() {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const categories = useAdminCategories()
  const remove = useDeleteCategory()
  const [deletingId, setDeletingId] = useState<number>()
  const [modal, setModal] = useState<ModalState>({ seq: 0, open: false })

  const openModal = (category?: CategoryView) => setModal((m) => ({ seq: m.seq + 1, open: true, category }))
  // 只置 open=false，保留 category 和 seq：弹窗的关闭动画还在播放，此时不能换 key 或清数据，否则内容会闪一下
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const onDelete = async (category: CategoryView) => {
    setDeletingId(category.id)
    try {
      await remove.mutateAsync(category.id)
      void message.success(t('categories.deleted'))
    } catch (error) {
      // 409：后端说明“该领域下仍有文章”，直接展示其 message
      toastError(error)
    } finally {
      setDeletingId(undefined)
    }
  }

  const columns = useCategoryColumns({ deletingId, onEdit: openModal, onDelete })
  const list = categories.data ?? []
  const nextSortOrder = list.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 10

  return (
    <>
      <PageHeader
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            {t('categories.create')}
          </Button>
        }
      />
      <Alert type="warning" showIcon style={{ marginBottom: 16 }} title={t('categories.builtinNotice')} />
      {categories.isError ? (
        <QueryError error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <div className={articleStyles.tableWrap}>
          <Table<CategoryView>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={categories.isFetching}
            pagination={false}
            scroll={{ x: 760 }}
          />
        </div>
      )}
      <CategoryFormModal
        key={modal.seq}
        open={modal.open}
        category={modal.category}
        nextSortOrder={nextSortOrder}
        onClose={closeModal}
      />
    </>
  )
}
