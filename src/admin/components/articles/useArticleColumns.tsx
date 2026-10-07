import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLocalizedName } from '../../../hooks/useLocalized'
import type { ArticleListItem } from '../../../types/api'
import { formatDateTime } from '../../utils/datetime'
import { LevelTag, StatusTag } from '../common/Tags'
import commonStyles from '../common/common.module.css'
import styles from './articles.module.css'

/** 标签列最多直接展示的个数，其余折叠成 +N（完整列表放在 Tooltip 里）。 */
const VISIBLE_TAGS = 3

interface Options {
  /** 正在删除的文章 id，用于让对应行的删除按钮显示 loading。 */
  deletingId: number | undefined
  onDelete: (id: number) => Promise<void>
}

/**
 * 文章列表的列定义。单独成文件：列定义冗长，放在页面里会让页面逻辑淹没其中。
 * 不用 useMemo：useLocalizedName 每次渲染都返回新函数，缓存永远命中不了，白白增加依赖维护成本。
 */
export function useArticleColumns({ deletingId, onDelete }: Options): ColumnsType<ArticleListItem> {
  const { t } = useTranslation('admin')
  const localized = useLocalizedName()

  return [
    {
      title: t('articles.col.title'),
      dataIndex: 'title',
      width: 320,
      render: (title: string, row) => (
        <Link className={styles.titleLink} to={`/admin/articles/${row.id}`}>
          {title}
        </Link>
      ),
    },
    {
      title: t('articles.col.status'),
      dataIndex: 'status',
      width: 88,
      render: (_: unknown, row) => <StatusTag status={row.status} />,
    },
    {
      title: t('articles.col.level'),
      dataIndex: 'level',
      width: 88,
      render: (_: unknown, row) => <LevelTag level={row.level} />,
    },
    {
      title: t('articles.col.category'),
      width: 110,
      render: (_: unknown, row) =>
        row.category ? (
          localized(row.category)
        ) : (
          // 草稿没有领域无法发布；用警示色提醒管理员补上
          <span className={commonStyles.warn}>{t('articles.uncategorized')}</span>
        ),
    },
    {
      title: t('articles.col.tags'),
      width: 200,
      render: (_: unknown, row) => {
        const extra = row.tags.slice(VISIBLE_TAGS)
        return (
          <Space size={[0, 4]} wrap>
            {row.tags.slice(0, VISIBLE_TAGS).map((tag) => (
              <Tag key={tag.id}>{localized(tag)}</Tag>
            ))}
            {extra.length > 0 && (
              <Tooltip title={extra.map(localized).join('、')}>
                <Tag>+{extra.length}</Tag>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    { title: t('articles.col.views'), dataIndex: 'viewCount', width: 80, align: 'right' },
    {
      title: t('articles.col.updatedAt'),
      dataIndex: 'updatedAt',
      width: 150,
      render: (iso: string) => formatDateTime(iso),
    },
    {
      title: t('articles.col.actions'),
      width: 132,
      fixed: 'right',
      render: (_: unknown, row) => (
        <Space size={0}>
          <Tooltip title={t('common.edit')}>
            <Link to={`/admin/articles/${row.id}`}>
              <Button type="text" icon={<EditOutlined />} aria-label={t('common.edit')} />
            </Link>
          </Tooltip>
          {/* 只有已发布的文章前台才看得到 */}
          {row.status === 'PUBLISHED' && (
            <Tooltip title={t('articles.viewOnSite')}>
              <Button
                type="text"
                icon={<EyeOutlined />}
                href={`/articles/${encodeURIComponent(row.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('articles.viewOnSite')}
              />
            </Tooltip>
          )}
          <Popconfirm
            title={t('articles.deleteConfirm')}
            description={row.title}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(row.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === row.id}
              aria-label={t('common.delete')}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]
}
