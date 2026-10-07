import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, type FormListFieldData } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Section } from '../common/Section'
import { ListControls } from './ListControls'
import styles from './resume.module.css'

interface SortableListProps {
  /** 列表在表单里的字段名（顶层，如 'experience'）。 */
  name: string
  title: string
  addLabel: string
  /** 每张卡片的标题，index 从 0 开始。 */
  itemTitle: (index: number) => string
  /** 条目上限，与后端 @Size 对应；到达后禁用“添加”。 */
  max: number
  /** 新增条目的初始值（含嵌套数组字段的空数组）。 */
  createItem: () => object
  /** 渲染一张卡片里的表单项；表单项的 name 用 [field.name, '字段'] 的形式。 */
  children: (field: FormListFieldData) => ReactNode
}

/**
 * 简历里“可增删、可排序的对象列表”（技能分组、工作、项目、教育）的通用容器。
 * 四个区块结构完全相同，只有卡片内的字段不同，所以抽成一个组件，字段由 children 提供。
 */
export function SortableList({ name, title, addLabel, itemTitle, max, createItem, children }: SortableListProps) {
  const { t } = useTranslation('admin')
  return (
    <Form.List name={name}>
      {(fields, { add, remove, move }) => (
        <Section
          title={title}
          extra={
            <Button
              icon={<PlusOutlined />}
              disabled={fields.length >= max}
              onClick={() => add(createItem())}
            >
              {addLabel}
            </Button>
          }
        >
          {fields.length === 0 && <p className={styles.empty}>{t('resume.listEmpty')}</p>}
          {fields.map((field, index) => (
            <Card
              key={field.key}
              size="small"
              className={styles.card}
              title={itemTitle(index)}
              extra={<ListControls index={index} count={fields.length} onMove={move} onRemove={remove} />}
            >
              {children(field)}
            </Card>
          ))}
          {fields.length >= max && <p className={styles.empty}>{t('resume.maxReached', { max })}</p>}
        </Section>
      )}
    </Form.List>
  )
}
