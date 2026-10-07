import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { EMPTY_EXPERIENCE, RESUME_LIMITS as L } from '../../utils/resumeForm'
import { maxLen } from '../../utils/validators'
import { SortableList } from './SortableList'
import { StringList } from './StringList'
import styles from './resume.module.css'

/** 工作经历：公司/职位/时间/地点 + 要点列表。 */
export function ExperienceSection() {
  const { t } = useTranslation('admin')
  const tooLong = t('resume.tooLong')
  return (
    <SortableList
      name="experience"
      title={t('resume.experience')}
      addLabel={t('resume.addExperience')}
      itemTitle={(i) => t('resume.experienceN', { n: i + 1 })}
      max={L.experience}
      createItem={() => ({ ...EMPTY_EXPERIENCE, highlights: [] })}
    >
      {(field) => (
        <>
          <div className={styles.grid}>
            <Form.Item name={[field.name, 'company']} label={t('resume.company')} rules={[maxLen(L.shortText, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, 'position']} label={t('resume.position')} rules={[maxLen(L.shortText, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, 'period']} label={t('resume.period')} extra={t('resume.periodHelp')} rules={[maxLen(L.period, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, 'location']} label={t('resume.location')} rules={[maxLen(L.shortText, tooLong)]}>
              <Input />
            </Form.Item>
          </div>
          <StringList
            name={[field.name, 'highlights']}
            label={t('resume.highlights')}
            addLabel={t('resume.addHighlight')}
            max={L.highlights}
            maxLength={L.bullet}
            tooLong={t('resume.bulletTooLong', { max: L.bullet })}
          />
        </>
      )}
    </SortableList>
  )
}
