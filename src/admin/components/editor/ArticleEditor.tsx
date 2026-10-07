import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ArticleEditView } from '../../../types/api'
import { useArticleEditor } from '../../hooks/useArticleEditor'
import { formatDateTime } from '../../utils/datetime'
import { requiredText } from '../../utils/validators'
import { LeaveConfirm } from '../common/LeaveConfirm'
import { PageHeader } from '../common/PageHeader'
import { Section } from '../common/Section'
import { BasicFields } from './BasicFields'
import { MarkdownField } from './MarkdownField'
import { MetaFields } from './MetaFields'
import { SourceFields } from './SourceFields'
import styles from './editor.module.css'

/** 文章编辑表单（新建 / 编辑共用）。article 为空即新建。 */
export function ArticleEditor({ article }: { article?: ArticleEditView }) {
  const { t } = useTranslation('admin')
  const editor = useArticleEditor(article)

  return (
    <>
      <PageHeader
        title={article ? t('editor.editTitle') : t('editor.createTitle')}
        subtitle={article ? undefined : t('editor.createSubtitle')}
      />
      {article && (
        <p className={styles.metaLine}>
          {t('editor.metaLine', {
            views: article.viewCount,
            created: formatDateTime(article.createdAt),
            updated: formatDateTime(article.updatedAt),
          })}
        </p>
      )}
      <Form
        form={editor.form}
        name="article"
        layout="vertical"
        initialValues={editor.initialValues}
        onValuesChange={editor.onValuesChange}
        onFinish={editor.submit}
        scrollToFirstError
      >
        <BasicFields isEdit={Boolean(article)} />
        <MetaFields />
        <Section title={t('editor.sectionContent')}>
          <Form.Item name="content" label={t('editor.content')} rules={[requiredText(t('editor.contentRequired'))]}>
            <MarkdownField />
          </Form.Item>
        </Section>
        <SourceFields />
        <div className={styles.actions}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={editor.saving} aria-keyshortcuts="Control+S Meta+S">
            {t('common.save')}
          </Button>
          <Link to="/admin/articles">
            <Button icon={<ArrowLeftOutlined />}>{t('editor.backToList')}</Button>
          </Link>
          {editor.dirty && <span className={styles.dirtyHint}>{t('editor.unsaved')}</span>}
          <span className={styles.actionsSpacer} />
          {article && (
            <Button danger icon={<DeleteOutlined />} onClick={editor.confirmDelete}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      </Form>
      <LeaveConfirm blocker={editor.blocker} />
    </>
  )
}
