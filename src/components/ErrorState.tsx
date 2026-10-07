import { Button, Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/client'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

/** 数据加载失败的统一展示：给出后端提示和重试入口，而不是留一片空白。 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <Result
      status="warning"
      title={t('common.loadFailed')}
      subTitle={error instanceof ApiError ? error.message : undefined}
      extra={onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
    />
  )
}
