import { PrinterOutlined } from '@ant-design/icons'
import { Button, Segmented, Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useResume } from '../api/queries'
import { ErrorState } from '../components/ErrorState'
import { ResumePaper } from '../components/ResumePaper'
import { SITE } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { toResumeLang, type AppLanguage } from '../i18n/language'
import type { ResumeLang } from '../types/api'
import styles from './Resume.module.css'

const LNG_OF: Record<ResumeLang, AppLanguage> = { zh: 'zh-CN', en: 'en-US' }

/**
 * 简历页。简历语言的取值优先级：URL 的 ?lang= > 当前界面语言。
 * 支持 ?lang= 是为了能把“英文版简历”的链接直接发给别人，不依赖对方浏览器的语言设置。
 */
export default function Resume() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()

  const requested = params.get('lang')
  const lang: ResumeLang = requested === 'zh' || requested === 'en' ? requested : toResumeLang(i18n.language)
  const resume = useResume(lang)
  usePageMeta(`${resume.data?.basics.name || t('resume.title')} · ${SITE.name}`)

  return (
    <div className={`container ${styles.page}`}>
      {/* 工具栏在打印时隐藏，只输出简历本体 */}
      <div className={styles.toolbar}>
        <Segmented
          aria-label={t('resume.langLabel')}
          value={lang}
          onChange={(value) => setParams({ lang: value })}
          options={[
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'English' },
          ]}
        />
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
          {t('resume.print')}
        </Button>
      </div>

      {resume.isError ? (
        <ErrorState error={resume.error} onRetry={() => void resume.refetch()} />
      ) : resume.isPending ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <ResumePaper data={resume.data} lng={LNG_OF[lang]} />
      )}
    </div>
  )
}
