import { LinkOutlined } from '@ant-design/icons'
import { App, Button, Input } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorToast } from '../../hooks/useErrorToast'
import { MAX_IMPORT_URLS, parseImportUrls } from '../../utils/importFiles'
import type { ImportResult } from '../../../types/api'
import styles from './import.module.css'

interface ImportUrlBoxProps {
  disabled?: boolean
  importing?: boolean
  onImport: (urls: string[]) => Promise<ImportResult>
  onImported: (result: ImportResult) => void
}

/** 粘贴公开文章链接并导入。解析在前端先过滤非法行，真正抓取在后端。 */
export function ImportUrlBox({ disabled, importing, onImport, onImported }: ImportUrlBoxProps) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const [raw, setRaw] = useState('')

  const start = async () => {
    const { urls, skipped } = parseImportUrls(raw)
    if (skipped > 0) {
      void message.warning(t('import.urlsSkipped', { count: skipped }))
    }
    if (urls.length === 0) {
      void message.warning(t('import.urlsEmpty'))
      return
    }
    const batch = urls.slice(0, MAX_IMPORT_URLS)
    if (urls.length > MAX_IMPORT_URLS) {
      void message.warning(t('import.urlsTooMany', { max: MAX_IMPORT_URLS }))
    }
    try {
      onImported(await onImport(batch))
      setRaw('')
    } catch (error) {
      toastError(error, t('import.failed'))
    }
  }

  const count = parseImportUrls(raw).urls.length
  const busy = Boolean(importing) || Boolean(disabled)

  return (
    <div>
      <p className={styles.hint}>{t('import.urlsHint', { max: MAX_IMPORT_URLS })}</p>
      <Input.TextArea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={t('import.urlsPlaceholder')}
        autoSize={{ minRows: 4, maxRows: 10 }}
        disabled={busy}
      />
      <div className={styles.actions}>
        <Button
          type="primary"
          icon={<LinkOutlined />}
          loading={Boolean(importing)}
          disabled={busy || count === 0}
          onClick={() => void start()}
        >
          {t('import.urlsStart', { count: Math.min(count, MAX_IMPORT_URLS) })}
        </Button>
      </div>
    </div>
  )
}
