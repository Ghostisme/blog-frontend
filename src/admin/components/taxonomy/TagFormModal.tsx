import { Alert, App, Form, Input, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import type { TagRequest, TagView } from '../../../types/api'
import { useErrorToast } from '../../hooks/useErrorToast'
import { useUpdateTag } from '../../hooks/useTaxonomy'
import { maxLen, requiredText } from '../../utils/validators'

interface TagFormModalProps {
  open: boolean
  tag?: TagView
  onClose: () => void
}

const FORM_ID = 'tag-form'

/**
 * 标签改名弹窗（标签没有“新增”，随文章保存自动创建；slug 也不可改，它是去重依据）。
 * 父组件每次打开换 key 重新挂载，原因同 CategoryFormModal。
 */
export function TagFormModal({ open, tag, onClose }: TagFormModalProps) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const update = useUpdateTag()
  const [form] = Form.useForm<TagRequest>()
  const nameZh = Form.useWatch('nameZh', form)

  const onFinish = async (values: TagRequest) => {
    if (!tag) {
      return
    }
    try {
      await update.mutateAsync({ id: tag.id, body: { nameZh: values.nameZh.trim(), nameEn: values.nameEn.trim() } })
      void message.success(t('common.saved'))
      onClose()
    } catch (error) {
      toastError(error)
    }
  }

  // 后端在保存文章时按“中文名”生成 slug 来匹配标签。改了中文名后，再保存带这个标签的文章，
  // 会按新名字匹配不到原标签而新建一个，原标签就从该文章上脱落。只在中文名真的被改动时提示
  const renamedZh = Boolean(tag) && nameZh !== undefined && nameZh.trim() !== tag?.nameZh

  return (
    <Modal
      open={open}
      title={t('tags.editTitle')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      okButtonProps={{ htmlType: 'submit', form: FORM_ID, loading: update.isPending }}
      onCancel={onClose}
      maskClosable={false}
      destroyOnHidden
    >
      <Form<TagRequest>
        id={FORM_ID}
        form={form}
        layout="vertical"
        disabled={update.isPending}
        initialValues={{ nameZh: tag?.nameZh, nameEn: tag?.nameEn }}
        onFinish={onFinish}
      >
        <Form.Item label={t('tags.slug')} extra={t('tags.slugHelp')}>
          <Input value={tag?.slug} readOnly disabled />
        </Form.Item>
        <Form.Item name="nameZh" label={t('tags.nameZh')} rules={[requiredText(t('tags.nameRequired')), maxLen(64, t('tags.nameTooLong'))]}>
          <Input />
        </Form.Item>
        {renamedZh && <Alert type="warning" showIcon style={{ marginBottom: 16 }} title={t('tags.renameWarning')} />}
        <Form.Item name="nameEn" label={t('tags.nameEn')} rules={[requiredText(t('tags.nameRequired')), maxLen(64, t('tags.nameTooLong'))]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}
