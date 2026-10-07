import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Alert, App, Button, Checkbox, Input, Popconfirm, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TagView } from '../../types/api'
import { PageHeader } from '../components/common/PageHeader'
import { QueryError } from '../components/common/QueryError'
import { TagFormModal } from '../components/taxonomy/TagFormModal'
import { useErrorToast } from '../hooks/useErrorToast'
import { useAdminTags, useDeleteTag } from '../hooks/useTaxonomy'
import articleStyles from '../components/articles/articles.module.css'

interface ModalState {
  seq: number
  open: boolean
  tag?: TagView
}

/** 标签管理：改名、删除。标签随文章保存自动创建，所以没有“新增”。 */
export default function TagsPage() {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const tags = useAdminTags()
  const remove = useDeleteTag()
  const [deletingId, setDeletingId] = useState<number>()
  const [modal, setModal] = useState<ModalState>({ seq: 0, open: false })
  const [keyword, setKeyword] = useState('')
  const [onlyUnused, setOnlyUnused] = useState(false)

  const onDelete = async (tag: TagView) => {
    setDeletingId(tag.id)
    try {
      await remove.mutateAsync(tag.id)
      void message.success(t('tags.deleted'))
    } catch (error) {
      toastError(error)
    } finally {
      setDeletingId(undefined)
    }
  }

  // 导入会一次产生大量标签，前端筛选 + 「仅看未使用」方便集中清理。标签总量有限，无需服务端分页
  const needle = keyword.trim().toLowerCase()
  const rows = (tags.data ?? []).filter(
    (tag) =>
      (!onlyUnused || tag.articleCount === 0) &&
      (!needle || [tag.nameZh, tag.nameEn, tag.slug].some((s) => s.toLowerCase().includes(needle))),
  )

  const columns: ColumnsType<TagView> = [
    { title: t('tags.col.nameZh'), dataIndex: 'nameZh' },
    { title: t('tags.col.nameEn'), dataIndex: 'nameEn' },
    { title: t('tags.col.slug'), dataIndex: 'slug', render: (slug: string) => <code>{slug}</code> },
    {
      title: t('tags.col.articleCount'),
      dataIndex: 'articleCount',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.articleCount - b.articleCount,
    },
    {
      title: t('tags.col.actions'),
      width: 100,
      fixed: 'right',
      render: (_: unknown, row) => (
        <Space size={0}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={t('common.edit')}
            onClick={() => setModal((m) => ({ seq: m.seq + 1, open: true, tag: row }))}
          />
          <Popconfirm
            title={t('tags.deleteConfirm', { name: row.nameZh })}
            description={t('tags.deleteHint', { count: row.articleCount })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(row)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} loading={deletingId === row.id} aria-label={t('common.delete')} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={t('tags.title')} subtitle={t('tags.subtitle')} />
      <Alert type="info" showIcon style={{ marginBottom: 16 }} title={t('tags.autoCreateNotice')} />
      <div className={articleStyles.filters}>
        <Input.Search
          className={articleStyles.search}
          aria-label={t('tags.searchLabel')}
          placeholder={t('tags.searchPlaceholder')}
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={setKeyword}
        />
        <Checkbox checked={onlyUnused} onChange={(e) => setOnlyUnused(e.target.checked)}>
          {t('tags.onlyUnused')}
        </Checkbox>
      </div>
      {tags.isError ? (
        <QueryError error={tags.error} onRetry={() => void tags.refetch()} />
      ) : (
        <div className={articleStyles.tableWrap}>
          <Table<TagView>
            rowKey="id"
            columns={columns}
            dataSource={rows}
            loading={tags.isFetching}
            scroll={{ x: 640 }}
            pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
          />
        </div>
      )}
      <TagFormModal key={modal.seq} open={modal.open} tag={modal.tag} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </>
  )
}
