import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { RESUME_LIMITS as L } from '../../utils/resumeForm'
import { HTTP_URL_PATTERN, maxLen, patternRule } from '../../utils/validators'
import { Section } from '../common/Section'
import { ListControls } from './ListControls'
import styles from './resume.module.css'

/** 基本信息 + 外部链接。简历页对所有访客公开，邮箱/电话会被看到，所以顶部给出醒目的隐私提示。 */
export function BasicsSection() {
  const { t } = useTranslation('admin')
  const urlRule = patternRule(HTTP_URL_PATTERN, t('resume.urlInvalid'))

  return (
    <Section title={t('resume.basics')}>
      <Alert type="warning" showIcon style={{ marginBottom: 16 }} title={t('resume.privacyNotice')} />
      <div className={styles.grid}>
        <Form.Item name={['basics', 'name']} label={t('resume.name')} rules={[maxLen(L.name, t('resume.tooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item name={['basics', 'title']} label={t('resume.jobTitle')} rules={[maxLen(L.shortText, t('resume.tooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item
          name={['basics', 'email']}
          label={t('resume.email')}
          extra={t('resume.publicField')}
          rules={[{ type: 'email', message: t('resume.emailInvalid') }, maxLen(L.email, t('resume.tooLong'))]}
        >
          <Input type="email" autoComplete="off" />
        </Form.Item>
        <Form.Item name={['basics', 'phone']} label={t('resume.phone')} extra={t('resume.publicField')} rules={[maxLen(L.phone, t('resume.tooLong'))]}>
          <Input type="tel" autoComplete="off" />
        </Form.Item>
        <Form.Item name={['basics', 'location']} label={t('resume.location')} rules={[maxLen(L.shortText, t('resume.tooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item name={['basics', 'website']} label={t('resume.website')} rules={[urlRule, maxLen(L.website, t('resume.tooLong'))]}>
          <Input placeholder="https://" inputMode="url" />
        </Form.Item>
      </div>
      <Form.Item name={['basics', 'avatarUrl']} label={t('resume.avatarUrl')} rules={[urlRule, maxLen(L.url, t('resume.tooLong'))]}>
        <Input placeholder="https://" inputMode="url" />
      </Form.Item>

      <Form.List name={['basics', 'links']}>
        {(fields, { add, remove, move }) => (
          <div role="group" aria-label={t('resume.links')}>
            <div className={styles.stringListHead}>
              <span>{t('resume.links')}</span>
              <Button size="small" icon={<PlusOutlined />} disabled={fields.length >= L.links} onClick={() => add({ label: '', url: '' })}>
                {t('resume.addLink')}
              </Button>
            </div>
            {fields.map((field, index) => (
              <div className={styles.row} key={field.key}>
                <div className={styles.rowInput}>
                  <div className={styles.grid}>
                    <Form.Item name={[field.name, 'label']} rules={[maxLen(L.name, t('resume.tooLong'))]}>
                      <Input placeholder={t('resume.linkLabel')} aria-label={t('resume.linkLabel')} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'url']} rules={[urlRule, maxLen(L.url, t('resume.tooLong'))]}>
                      <Input placeholder="https://" aria-label={t('resume.linkUrl')} inputMode="url" />
                    </Form.Item>
                  </div>
                </div>
                <ListControls index={index} count={fields.length} onMove={move} onRemove={remove} />
              </div>
            ))}
          </div>
        )}
      </Form.List>
    </Section>
  )
}
