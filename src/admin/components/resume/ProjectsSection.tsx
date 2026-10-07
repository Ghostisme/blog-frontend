import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { EMPTY_PROJECT, RESUME_LIMITS as L } from '../../utils/resumeForm'
import { HTTP_URL_PATTERN, eachItemRule, maxLen, patternRule } from '../../utils/validators'
import { SortableList } from './SortableList'
import { StringList } from './StringList'
import { TokenSelect } from './TokenSelect'
import styles from './resume.module.css'

/** 项目经历：名称/角色/时间/链接 + 描述 + 技术栈 + 要点。 */
export function ProjectsSection() {
  const { t } = useTranslation('admin')
  const tooLong = t('resume.tooLong')
  return (
    <SortableList
      name="projects"
      title={t('resume.projects')}
      addLabel={t('resume.addProject')}
      itemTitle={(i) => t('resume.projectN', { n: i + 1 })}
      max={L.projects}
      createItem={() => ({ ...EMPTY_PROJECT, techStack: [], highlights: [] })}
    >
      {(field) => (
        <>
          <div className={styles.grid}>
            <Form.Item name={[field.name, 'name']} label={t('resume.projectName')} rules={[maxLen(L.shortText, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, 'role']} label={t('resume.role')} rules={[maxLen(L.shortText, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, 'period']} label={t('resume.period')} extra={t('resume.periodHelp')} rules={[maxLen(L.period, tooLong)]}>
              <Input />
            </Form.Item>
            <Form.Item
              name={[field.name, 'url']}
              label={t('resume.projectUrl')}
              rules={[patternRule(HTTP_URL_PATTERN, t('resume.urlInvalid')), maxLen(L.url, tooLong)]}
            >
              <Input placeholder="https://" inputMode="url" />
            </Form.Item>
          </div>
          <Form.Item name={[field.name, 'description']} label={t('resume.description')} rules={[maxLen(L.description, tooLong)]}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 8 }} showCount />
          </Form.Item>
          <Form.Item
            name={[field.name, 'techStack']}
            label={t('resume.techStack')}
            extra={t('resume.tokenHelp', { max: L.techStack })}
            rules={[eachItemRule(L.token, tooLong)]}
          >
            <TokenSelect max={L.techStack} />
          </Form.Item>
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
