import { DatePicker, Form, Radio, Select } from 'antd'
import type { FormRule } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../../../hooks/useLocalized'
import { ARTICLE_LEVELS } from '../../../types/api'
import { useAdminCategories, useAdminTags } from '../../hooks/useTaxonomy'
import { MAX_TAGS, type ArticleFormValues } from '../../utils/articleForm'
import { eachItemRule } from '../../utils/validators'
import { Section } from '../common/Section'
import styles from './editor.module.css'

/** 等级、领域、状态、标签、发布时间。 */
export function MetaFields() {
  const { t } = useTranslation('admin')
  const localized = useLocalizedName()
  const categories = useAdminCategories()
  const tags = useAdminTags()

  // 发布必须有领域（后端会返回 400）。依赖 status：切换状态时重新校验领域，
  // 否则先选“已发布”再去选领域，错误提示会一直残留
  const categoryRules: FormRule[] = [
    ({ getFieldValue }) => ({
      validator: (_rule, value: ArticleFormValues['categoryId']) =>
        getFieldValue('status') === 'PUBLISHED' && !value
          ? Promise.reject(new Error(t('editor.categoryRequiredToPublish')))
          : Promise.resolve(),
    }),
  ]

  return (
    <Section title={t('editor.sectionMeta')}>
      <div className={styles.metaGrid}>
        <Form.Item name="level" label={t('editor.level')}>
          <Select options={ARTICLE_LEVELS.map((level) => ({ value: level, label: t(`level.${level}`) }))} />
        </Form.Item>
        <Form.Item name="categoryId" label={t('editor.category')} dependencies={['status']} rules={categoryRules}>
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            loading={categories.isPending}
            placeholder={t('editor.categoryPlaceholder')}
            options={categories.data?.map((c) => ({ value: c.id, label: localized(c) }))}
          />
        </Form.Item>
        <Form.Item name="status" label={t('editor.status')}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={[
              { value: 'DRAFT', label: t('status.DRAFT') },
              { value: 'PUBLISHED', label: t('status.PUBLISHED') },
            ]}
          />
        </Form.Item>
        <Form.Item name="publishedAt" label={t('editor.publishedAt')} extra={t('editor.publishedAtHelp')}>
          <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
      </div>
      <Form.Item
        name="tags"
        label={t('editor.tags')}
        extra={t('editor.tagsHelp', { max: MAX_TAGS })}
        rules={[eachItemRule(64, t('editor.tagTooLong'))]}
      >
        {/* tags 模式：回车或逗号确认一个标签；选项取自已有标签名，避免同一标签写出不同写法 */}
        <Select
          mode="tags"
          maxCount={MAX_TAGS}
          tokenSeparators={[',', '，']}
          placeholder={t('editor.tagsPlaceholder')}
          options={tags.data?.map((tag) => ({ value: tag.nameZh, label: tag.nameZh }))}
        />
      </Form.Item>
    </Section>
  )
}
