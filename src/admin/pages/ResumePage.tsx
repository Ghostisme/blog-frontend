import { App, Segmented, Skeleton } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toResumeLang } from '../../i18n/language'
import type { ResumeLang } from '../../types/api'
import { LeaveConfirm } from '../components/common/LeaveConfirm'
import { PageHeader } from '../components/common/PageHeader'
import { QueryError } from '../components/common/QueryError'
import { ResumeEditor } from '../components/resume/ResumeEditor'
import { useAdminResume } from '../hooks/useResumeAdmin'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'

/** 简历管理：中文 / 英文两份各自加载、各自保存。 */
export default function ResumePage() {
  const { t, i18n } = useTranslation('admin')
  const { modal } = App.useApp()
  // 初始选中与界面语言一致：在英文界面下进来，大概率是要改英文简历
  const [lang, setLang] = useState<ResumeLang>(() => toResumeLang(i18n.language))
  const { dirty, markDirty, markClean, blocker } = useUnsavedGuard()
  const resume = useAdminResume(lang)

  const switchLang = (next: ResumeLang) => {
    if (next === lang) {
      return
    }
    if (!dirty) {
      setLang(next)
      return
    }
    // 两份简历是分开保存的；带着未保存的改动切换会丢失它们，先确认
    modal.confirm({
      title: t('resume.switchTitle'),
      content: t('resume.switchContent'),
      okText: t('resume.switchDiscard'),
      cancelText: t('unsaved.stay'),
      okButtonProps: { danger: true },
      onOk: () => {
        markClean()
        setLang(next)
      },
    })
  }

  return (
    <>
      <PageHeader
        title={t('resume.title')}
        subtitle={t('resume.subtitle')}
        extra={
          <Segmented<ResumeLang>
            aria-label={t('resume.langLabel')}
            value={lang}
            onChange={switchLang}
            options={[
              { value: 'zh', label: t('resume.langZh') },
              { value: 'en', label: t('resume.langEn') },
            ]}
          />
        }
      />
      {resume.isPending ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : resume.isError ? (
        <QueryError error={resume.error} onRetry={() => void resume.refetch()} />
      ) : (
        <ResumeEditor key={lang} lang={lang} initial={resume.data} dirty={dirty} onEdit={markDirty} onSaved={markClean} />
      )}
      <LeaveConfirm blocker={blocker} />
    </>
  )
}
