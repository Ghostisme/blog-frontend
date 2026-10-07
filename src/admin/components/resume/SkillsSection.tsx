import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { EMPTY_SKILL_GROUP, RESUME_LIMITS as L } from '../../utils/resumeForm'
import { eachItemRule, maxLen } from '../../utils/validators'
import { SortableList } from './SortableList'
import { TokenSelect } from './TokenSelect'

/** 技能分组：分组名 + 技能项（回车/逗号确认一项）。 */
export function SkillsSection() {
  const { t } = useTranslation('admin')
  return (
    <SortableList
      name="skills"
      title={t('resume.skills')}
      addLabel={t('resume.addSkillGroup')}
      itemTitle={(i) => t('resume.skillGroupN', { n: i + 1 })}
      max={L.skillGroups}
      createItem={() => ({ ...EMPTY_SKILL_GROUP, items: [] })}
    >
      {(field) => (
        <>
          <Form.Item name={[field.name, 'name']} label={t('resume.skillGroupName')} rules={[maxLen(L.name, t('resume.tooLong'))]}>
            <Input />
          </Form.Item>
          <Form.Item
            name={[field.name, 'items']}
            label={t('resume.skillItems')}
            extra={t('resume.tokenHelp', { max: L.skillItems })}
            rules={[eachItemRule(L.token, t('resume.tooLong'))]}
          >
            <TokenSelect max={L.skillItems} />
          </Form.Item>
        </>
      )}
    </SortableList>
  )
}
