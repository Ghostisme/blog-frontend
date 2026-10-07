import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { maxLen, patternRule, requiredText, SLUG_PATTERN } from '../../utils/validators'
import { Section } from '../common/Section'

/** 标题 / slug / 摘要。限制只用校验规则而不设 maxLength：粘贴超长内容时用户能看到“超出”的提示，而不是被悄悄截断。 */
export function BasicFields({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation('admin')
  return (
    <Section title={t('editor.sectionBasic')}>
      <Form.Item
        name="title"
        label={t('editor.title')}
        rules={[requiredText(t('editor.titleRequired')), maxLen(255, t('editor.titleTooLong'))]}
      >
        <Input showCount size="large" />
      </Form.Item>
      <Form.Item
        name="slug"
        label={t('editor.slug')}
        extra={isEdit ? t('editor.slugHelpEdit') : t('editor.slugHelpCreate')}
        rules={[maxLen(160, t('editor.slugTooLong')), patternRule(SLUG_PATTERN, t('editor.slugInvalid'))]}
      >
        <Input placeholder={t('editor.slugPlaceholder')} autoCapitalize="off" spellCheck={false} />
      </Form.Item>
      <Form.Item name="summary" label={t('editor.summary')} rules={[maxLen(500, t('editor.summaryTooLong'))]}>
        <Input.TextArea rows={3} showCount placeholder={t('editor.summaryPlaceholder')} />
      </Form.Item>
    </Section>
  )
}
