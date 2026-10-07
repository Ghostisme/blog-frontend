import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { EMPTY_EDUCATION, RESUME_LIMITS as L } from '../../utils/resumeForm'
import { maxLen } from '../../utils/validators'
import { SortableList } from './SortableList'
import styles from './resume.module.css'

/** 教育经历。 */
export function EducationSection() {
  const { t } = useTranslation('admin')
  const tooLong = t('resume.tooLong')
  return (
    <SortableList
      name="education"
      title={t('resume.education')}
      addLabel={t('resume.addEducation')}
      itemTitle={(i) => t('resume.educationN', { n: i + 1 })}
      max={L.education}
      createItem={() => ({ ...EMPTY_EDUCATION })}
    >
      {(field) => (
        <div className={styles.grid}>
          <Form.Item name={[field.name, 'school']} label={t('resume.school')} rules={[maxLen(L.shortText, tooLong)]}>
            <Input />
          </Form.Item>
          <Form.Item name={[field.name, 'degree']} label={t('resume.degree')} rules={[maxLen(L.shortText, tooLong)]}>
            <Input />
          </Form.Item>
          <Form.Item name={[field.name, 'major']} label={t('resume.major')} rules={[maxLen(L.shortText, tooLong)]}>
            <Input />
          </Form.Item>
          <Form.Item name={[field.name, 'period']} label={t('resume.period')} extra={t('resume.periodHelp')} rules={[maxLen(L.period, tooLong)]}>
            <Input />
          </Form.Item>
        </div>
      )}
    </SortableList>
  )
}
