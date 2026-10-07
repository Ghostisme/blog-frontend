import { Alert, Button, Statistic, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ImportItem, ImportResult, ImportStatus } from '../../../types/api'
import { Section } from '../common/Section'
import styles from './import.module.css'

const STATUS_COLOR: Record<ImportStatus, string> = {
  IMPORTED: 'success',
  SKIPPED: 'default',
  FAILED: 'error',
}

/** 导入结果：汇总数字 + 逐文件明细。失败项整行标红，方便管理员逐个排查。 */
export function ImportResultView({ result }: { result: ImportResult }) {
  const { t } = useTranslation('admin')

  const columns: ColumnsType<ImportItem> = [
    { title: t('import.col.file'), dataIndex: 'fileName', ellipsis: true, width: 240 },
    {
      title: t('import.col.status'),
      dataIndex: 'status',
      width: 100,
      filters: (['IMPORTED', 'SKIPPED', 'FAILED'] as const).map((s) => ({ text: t(`import.status.${s}`), value: s })),
      onFilter: (value, row) => row.status === value,
      render: (status: ImportStatus) => (
        <Tag color={STATUS_COLOR[status]} variant={status === 'FAILED' ? 'solid' : 'filled'}>
          {t(`import.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('import.col.title'),
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string | null, row) =>
        row.articleId && title ? <Link to={`/admin/articles/${row.articleId}`}>{title}</Link> : (title ?? '-'),
    },
    { title: t('import.col.message'), dataIndex: 'message', width: 240 },
  ]

  return (
    <Section title={t('import.resultTitle')}>
      {result.imported > 0 && (
        <Alert
          type="success"
          showIcon
          className={styles.cta}
          title={t('import.successTitle', { count: result.imported })}
          description={t('import.successHint')}
          action={
            <Link to="/admin/articles?status=DRAFT">
              <Button type="primary">{t('import.goCorrect')}</Button>
            </Link>
          }
        />
      )}
      <div className={styles.stats}>
        <Statistic title={t('import.total')} value={result.total} />
        <Statistic title={t('import.status.IMPORTED')} value={result.imported} />
        <Statistic title={t('import.status.SKIPPED')} value={result.skipped} />
        <Statistic
          title={t('import.status.FAILED')}
          value={result.failed}
          styles={{ content: result.failed > 0 ? { color: 'var(--admin-warn)' } : undefined }}
        />
      </div>
      <Table<ImportItem>
        size="middle"
        rowKey={(row, index) => `${row.fileName}-${index}`}
        columns={columns}
        dataSource={result.items}
        rowClassName={(row) => (row.status === 'FAILED' ? styles.failedRow : '')}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
      />
    </Section>
  )
}
