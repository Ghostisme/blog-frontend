import { CloudUploadOutlined } from '@ant-design/icons'
import { Alert, Button, Spin, type UploadFile } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportResult } from '../../types/api'
import { PageHeader } from '../components/common/PageHeader'
import { Section } from '../components/common/Section'
import { ImportDropzone } from '../components/import/ImportDropzone'
import { ImportResultView } from '../components/import/ImportResultView'
import { ImportUrlBox } from '../components/import/ImportUrlBox'
import { useErrorToast } from '../hooks/useErrorToast'
import { useImportArticleUrls, useImportArticles } from '../hooks/useImportArticles'
import { MAX_TOTAL_BYTES, formatBytes } from '../utils/importFiles'
import styles from '../components/import/import.module.css'

/** 导入文章：粘贴公开链接或上传 Markdown，统一进入草稿后再校正发布。 */
export default function ImportPage() {
  const { t } = useTranslation('admin')
  const toastError = useErrorToast()
  const importer = useImportArticles()
  const urlImporter = useImportArticleUrls()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)

  const totalBytes = fileList.reduce((sum, f) => sum + (f.originFileObj?.size ?? f.size ?? 0), 0)
  // 后端整个请求上限 60MB，超出会以 413 整批失败，所以提前拦截
  const tooBig = totalBytes > MAX_TOTAL_BYTES
  // 文件导入和链接导入共用一套结果表，同时点两次会互相覆盖，所以互斥
  const uploading = importer.isPending || urlImporter.isPending

  const start = async () => {
    const files = fileList.flatMap((f) => (f.originFileObj ? [f.originFileObj] : []))
    if (files.length === 0 || tooBig) {
      return
    }
    try {
      setResult(await importer.mutateAsync(files))
      // 成功后清空列表：留着的话很容易再点一次，把同一批文件又提交一遍（虽然后端会跳过重复项）
      setFileList([])
    } catch (error) {
      // 整批请求失败（网络、413 等）才会走到这里；保留文件列表，用户可直接重试
      toastError(error, t('import.failed'))
    }
  }

  return (
    <>
      <PageHeader title={t('import.title')} subtitle={t('import.subtitle')} />
      <Section>
        <Alert type="info" showIcon className={styles.cta} title={t('import.notice')} />
      </Section>
      <Section title={t('import.urlsTitle')}>
        <ImportUrlBox disabled={uploading} importing={urlImporter.isPending} onImport={(urls) => urlImporter.mutateAsync(urls)} onImported={setResult} />
      </Section>
      <Section title={t('import.filesTitle')}>
        <Spin spinning={uploading} tip={t('import.uploading')}>
          <ImportDropzone fileList={fileList} onChange={setFileList} disabled={uploading} />
        </Spin>
        {tooBig && (
          <Alert
            type="error"
            showIcon
            className={styles.cta}
            title={t('import.tooBig', { size: formatBytes(MAX_TOTAL_BYTES) })}
          />
        )}
        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            icon={<CloudUploadOutlined />}
            loading={importer.isPending}
            disabled={fileList.length === 0 || tooBig || uploading}
            onClick={() => void start()}
          >
            {t('import.start', { count: fileList.length })}
          </Button>
          <Button disabled={fileList.length === 0 || uploading} onClick={() => setFileList([])}>
            {t('import.clear')}
          </Button>
          {fileList.length > 0 && (
            <span className={styles.sizeInfo}>{t('import.totalSize', { size: formatBytes(totalBytes) })}</span>
          )}
        </div>
      </Section>
      {result && <ImportResultView result={result} />}
    </>
  )
}
