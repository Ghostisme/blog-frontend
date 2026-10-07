import { UploadOutlined } from '@ant-design/icons'
import { App, Button, Upload } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ResumeContent } from '../../../types/api'
import { useErrorToast } from '../../hooks/useErrorToast'
import { useParseResumePdf } from '../../hooks/useResumeAdmin'
import { formatBytes } from '../../utils/importFiles'
import styles from './resume.module.css'

const MAX_PDF_BYTES = 5 * 1024 * 1024

interface ResumePdfImportProps {
  dirty: boolean
  disabled?: boolean
  onParsed: (content: ResumeContent) => void
}

/**
 * 上传文字版 PDF，把解析结果交给表单。不自动保存。
 * beforeUpload 返回 false / LIST_IGNORE：文件不进 antd 列表，只触发一次解析。
 */
export function ResumePdfImport({ dirty, disabled, onParsed }: ResumePdfImportProps) {
  const { t } = useTranslation('admin')
  const { message, modal } = App.useApp()
  const toastError = useErrorToast()
  const parse = useParseResumePdf()

  const run = async (file: File) => {
    try {
      onParsed(await parse.mutateAsync(file))
      void message.success(t('resume.parsePdfOk'))
    } catch (error) {
      toastError(error, t('resume.parsePdfFailed'))
    }
  }

  const beforeUpload = (file: File) => {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.pdf')) {
      void message.warning(t('resume.parsePdfWrongType'))
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_PDF_BYTES) {
      void message.warning(t('resume.parsePdfTooBig', { size: formatBytes(MAX_PDF_BYTES) }))
      return Upload.LIST_IGNORE
    }
    const start = () => {
      void run(file)
    }
    if (dirty) {
      modal.confirm({
        title: t('resume.parsePdfDirty'),
        okText: t('resume.parsePdfDirtyOk'),
        cancelText: t('unsaved.stay'),
        okButtonProps: { danger: true },
        onOk: start,
      })
    } else {
      start()
    }
    return Upload.LIST_IGNORE
  }

  return (
    <div className={styles.pdfImport}>
      <Upload accept=".pdf" showUploadList={false} disabled={disabled || parse.isPending} beforeUpload={beforeUpload}>
        <Button icon={<UploadOutlined />} loading={parse.isPending} disabled={disabled}>
          {t('resume.parsePdf')}
        </Button>
      </Upload>
      <p className={styles.pdfHint}>{t('resume.parsePdfHint')}</p>
    </div>
  )
}
