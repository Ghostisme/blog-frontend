import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { maxLen } from '../../utils/validators'
import { ListControls } from './ListControls'
import styles from './resume.module.css'

interface StringListProps {
  /** 相对所在表单层级的字段路径，如 [field.name, 'highlights']。 */
  name: (string | number)[]
  label: string
  addLabel: string
  /** 条数上限。 */
  max: number
  /** 单条字符上限。 */
  maxLength: number
  tooLong: string
}

/**
 * 字符串列表（工作/项目的要点）：每条一个输入框，可增删、上下移动。
 * 用 Form.List 而不是“一个多行文本框按换行拆分”：后者无法排序，也看不出哪一条超长。
 */
export function StringList({ name, label, addLabel, max, maxLength, tooLong }: StringListProps) {
  const { t } = useTranslation('admin')
  return (
    <Form.List name={name}>
      {(fields, { add, remove, move }) => (
        <div className={styles.stringList} role="group" aria-label={label}>
          <div className={styles.stringListHead}>
            <span>{label}</span>
            <Button size="small" icon={<PlusOutlined />} disabled={fields.length >= max} onClick={() => add('')}>
              {addLabel}
            </Button>
          </div>
          {fields.map((field, index) => (
            <div className={styles.row} key={field.key}>
              <Form.Item name={field.name} rules={[maxLen(maxLength, tooLong)]} className={styles.rowInput}>
                <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} aria-label={t('resume.itemLabel', { label, index: index + 1 })} />
              </Form.Item>
              <ListControls index={index} count={fields.length} onMove={move} onRemove={remove} />
            </div>
          ))}
        </div>
      )}
    </Form.List>
  )
}
