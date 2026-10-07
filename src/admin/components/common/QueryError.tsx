import { Alert, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { errorMessage } from '../../utils/error'

interface QueryErrorProps {
  error: unknown
  onRetry?: () => void
}

/** 列表/详情加载失败时的统一提示，带重试按钮。展示后端给的具体原因而不是笼统的“出错了”。 */
export function QueryError({ error, onRetry }: QueryErrorProps) {
  const { t } = useTranslation('admin')
  return (
    <Alert
      type="error"
      showIcon
      title={t('common.loadFailed')}
      description={errorMessage(error, t('common.loadFailedHint'))}
      action={onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
    />
  )
}
