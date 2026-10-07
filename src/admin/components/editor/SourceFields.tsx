import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { HTTP_URL_PATTERN, maxLen, patternRule } from '../../utils/validators'
import { Section } from '../common/Section'
import styles from './editor.module.css'

/**
 * 来源与封面。链接只接受 http(s)：这些值会被前台渲染成 <a href> / <img src>，
 * 放行 javascript: 之类的协议就是 XSS 入口，后端同样会拒绝。
 */
export function SourceFields() {
  const { t } = useTranslation('admin')
  const urlRules = (tooLong: string) => [maxLen(512, tooLong), patternRule(HTTP_URL_PATTERN, t('editor.urlInvalid'))]
  return (
    <Section title={t('editor.sectionSource')}>
      <div className={styles.metaGrid}>
        <Form.Item name="sourceUrl" label={t('editor.sourceUrl')} rules={urlRules(t('editor.sourceUrlTooLong'))}>
          <Input type="url" placeholder="https://" inputMode="url" />
        </Form.Item>
        <Form.Item name="sourceAuthor" label={t('editor.sourceAuthor')} rules={[maxLen(128, t('editor.sourceAuthorTooLong'))]}>
          <Input />
        </Form.Item>
      </div>
      <Form.Item name="coverUrl" label={t('editor.coverUrl')} rules={urlRules(t('editor.coverUrlTooLong'))} extra={t('editor.coverHelp')}>
        <Input type="url" placeholder="https://" inputMode="url" />
      </Form.Item>
    </Section>
  )
}
