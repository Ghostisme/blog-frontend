import { Button, Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

/** 404 页：兜底匹配所有未知路径。 */
export default function NotFound() {
  const { t } = useTranslation()
  usePageMeta(`404 · ${t('notFound.title')}`)
  return (
    <div className="container" style={{ padding: '64px 0' }}>
      <Result
        status="404"
        title={t('notFound.title')}
        subTitle={t('notFound.subtitle')}
        extra={
          <Link to="/">
            <Button type="primary">{t('common.backHome')}</Button>
          </Link>
        }
      />
    </div>
  )
}
