import { SaveOutlined } from '@ant-design/icons'
import { App, Button, Form, Input } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ResumeContent, ResumeLang } from '../../../types/api'
import { useErrorToast } from '../../hooks/useErrorToast'
import { useSaveResume } from '../../hooks/useResumeAdmin'
import { RESUME_LIMITS, normalizeResume, toResumeRequest, type ResumeFormValues } from '../../utils/resumeForm'
import { maxLen } from '../../utils/validators'
import { Section } from '../common/Section'
import { BasicsSection } from './BasicsSection'
import { EducationSection } from './EducationSection'
import { ExperienceSection } from './ExperienceSection'
import { ProjectsSection } from './ProjectsSection'
import { ResumePdfImport } from './ResumePdfImport'
import { SkillsSection } from './SkillsSection'
import styles from './resume.module.css'

interface ResumeEditorProps {
  lang: ResumeLang
  /** 服务端当前内容。只在挂载时读取一次作为表单初始值，之后的后台刷新不会覆盖用户正在编辑的内容。 */
  initial: ResumeContent
  dirty: boolean
  onEdit: () => void
  onSaved: () => void
}

/**
 * 单一语言简历的编辑表单。页面以语言为 key 渲染本组件，切换语言即整体重建，
 * 两种语言的表单状态互不串扰。
 */
export function ResumeEditor({ lang, initial, dirty, onEdit, onSaved }: ResumeEditorProps) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const save = useSaveResume(lang)
  const [form] = Form.useForm<ResumeFormValues>()
  const [initialValues] = useState(() => normalizeResume(initial))
  // 用户每次编辑自增；保存期间若又有编辑，保存成功后不能把表单当作“已保存”
  const editSeq = useRef(0)
  // 保存请求期间用户切走了语言（组件已卸载）时，不要再去改表单或清脏标记
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const submit = async (values: ResumeFormValues) => {
    if (save.isPending) {
      return
    }
    const seqAtStart = editSeq.current
    try {
      // PUT 是整体覆盖：提交的必须是完整内容，缺字段的区块会被清空
      const saved = await save.mutateAsync(toResumeRequest(values))
      void message.success(t('resume.saved'))
      if (alive.current && editSeq.current === seqAtStart) {
        // 回填服务端规整后的内容（已去掉空行/空白项），界面与前台所见一致
        form.setFieldsValue(normalizeResume(saved))
        onSaved()
      }
    } catch (error) {
      toastError(error)
    }
  }

  return (
    <Form<ResumeFormValues>
      form={form}
      name={`resume-${lang}`}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={() => {
        editSeq.current += 1
        onEdit()
      }}
      onFinish={submit}
      scrollToFirstError
    >
      <ResumePdfImport
        dirty={dirty}
        disabled={save.isPending}
        onParsed={(content) => {
          form.setFieldsValue(normalizeResume(content))
          editSeq.current += 1
          onEdit()
        }}
      />
      <BasicsSection />
      <Section title={t('resume.summary')}>
        <Form.Item name="summary" label={t('resume.summary')} rules={[maxLen(RESUME_LIMITS.summary, t('resume.tooLong'))]}>
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 14 }} showCount />
        </Form.Item>
      </Section>
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <div className={styles.actions}>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={save.isPending}>
          {t('common.save')}
        </Button>
        {dirty && <span className={styles.dirtyHint}>{t('editor.unsaved')}</span>}
      </div>
    </Form>
  )
}
