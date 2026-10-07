import { DeleteOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { App, Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import type { CategoryView } from '../../../types/api'
import { isBuiltinCategory } from '../../utils/builtinCategories'

interface Options {
  deletingId: number | undefined
  onEdit: (category: CategoryView) => void
  onDelete: (category: CategoryView) => Promise<void>
}

/** 领域表格的列定义。 */
export function useCategoryColumns({ deletingId, onEdit, onDelete }: Options): ColumnsType<CategoryView> {
  const { t } = useTranslation('admin')
  const { modal } = App.useApp()

  /** 内置领域：弹出更醒目的危险确认框并说明后果，而不是普通的气泡确认。 */
  const confirmDeleteBuiltin = (category: CategoryView) =>
    modal.confirm({
      title: t('categories.builtinDeleteTitle', { name: category.nameZh }),
      content: t('categories.builtinDeleteContent'),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => onDelete(category),
    })

  return [
    { title: t('categories.col.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    {
      title: t('categories.col.code'),
      dataIndex: 'code',
      width: 180,
      render: (code: string) => (
        <Space size={6}>
          <code>{code}</code>
          {isBuiltinCategory(code) && (
            <Tooltip title={t('categories.builtinTip')}>
              <Tag color="gold" icon={<LockOutlined />}>
                {t('categories.builtin')}
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    { title: t('categories.col.nameZh'), dataIndex: 'nameZh' },
    { title: t('categories.col.nameEn'), dataIndex: 'nameEn' },
    { title: t('categories.col.icon'), dataIndex: 'icon', width: 110, render: (icon: string | null) => icon ?? '-' },
    { title: t('categories.col.articleCount'), dataIndex: 'articleCount', width: 100, align: 'right' },
    {
      title: t('categories.col.actions'),
      width: 110,
      fixed: 'right',
      render: (_: unknown, row) => {
        const builtin = isBuiltinCategory(row.code)
        const inUse = row.articleCount > 0
        const deleteButton = (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === row.id}
            // 仍有文章的领域后端会以 409 拒绝；提前禁用并说明原因，省得点了才知道
            disabled={inUse}
            aria-label={t('common.delete')}
            onClick={builtin ? () => confirmDeleteBuiltin(row) : undefined}
          />
        )
        return (
          <Space size={0}>
            <Button type="text" icon={<EditOutlined />} aria-label={t('common.edit')} onClick={() => onEdit(row)} />
            {inUse ? (
              <Tooltip title={t('categories.inUse', { count: row.articleCount })}>
                <span>{deleteButton}</span>
              </Tooltip>
            ) : builtin ? (
              deleteButton
            ) : (
              <Popconfirm
                title={t('categories.deleteConfirm', { name: row.nameZh })}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(row)}
              >
                {deleteButton}
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]
}
