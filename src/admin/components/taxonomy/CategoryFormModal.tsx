import { Alert, App, Form, Input, InputNumber, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CategoryRequest, CategoryView } from '../../../types/api'
import { useErrorToast } from '../../hooks/useErrorToast'
import { useSaveCategory } from '../../hooks/useTaxonomy'
import { isBuiltinCategory } from '../../utils/builtinCategories'
import { isApiStatus } from '../../utils/error'
import { CODE_PATTERN, maxLen, patternRule, requiredText } from '../../utils/validators'

interface CategoryFormModalProps {
  open: boolean
  /** 编辑时传入；新增为 undefined。 */
  category?: CategoryView
  /** 新增时的默认排序值（当前最大值 + 10）。 */
  nextSortOrder: number
  onClose: () => void
}

const FORM_ID = 'category-form'

/**
 * 领域新增/编辑弹窗。
 * 父组件每次打开都换一个 key 重新挂载本组件：antd 的 Form 实例会在关闭后保留上次的输入，
 * 不重建的话“新增”会带出上一次编辑的内容。
 */
export function CategoryFormModal({ open, category, nextSortOrder, onClose }: CategoryFormModalProps) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const toastError = useErrorToast()
  const save = useSaveCategory()
  const [form] = Form.useForm<CategoryRequest>()
  const builtin = category ? isBuiltinCategory(category.code) : false

  const onFinish = async (values: CategoryRequest) => {
    const body: CategoryRequest = {
      code: values.code.trim(),
      nameZh: values.nameZh.trim(),
      nameEn: values.nameEn.trim(),
      icon: values.icon?.trim() || null,
      sortOrder: values.sortOrder ?? 0,
    }
    try {
      await save.mutateAsync({ id: category?.id, body })
      void message.success(t('common.saved'))
      onClose()
    } catch (error) {
      if (isApiStatus(error, 409)) {
        // 唯一键冲突：错误精确挂到 code 输入框上，比一闪而过的 toast 更容易看到
        form.setFields([{ name: 'code', errors: [t('categories.codeDuplicate')] }])
      } else {
        toastError(error)
      }
    }
  }

  return (
    <Modal
      open={open}
      title={category ? t('categories.editTitle') : t('categories.createTitle')}
      okText={t('common.save')}
      cancelText={t('common.cancel')}
      okButtonProps={{ htmlType: 'submit', form: FORM_ID, loading: save.isPending }}
      onCancel={onClose}
      maskClosable={false}
      destroyOnHidden
    >
      {builtin && <Alert type="warning" showIcon style={{ marginBottom: 16 }} title={t('categories.builtinWarning')} />}
      <Form<CategoryRequest>
        id={FORM_ID}
        form={form}
        layout="vertical"
        disabled={save.isPending}
        initialValues={
          category
            ? { code: category.code, nameZh: category.nameZh, nameEn: category.nameEn, icon: category.icon ?? '', sortOrder: category.sortOrder }
            : { sortOrder: nextSortOrder }
        }
        onFinish={onFinish}
      >
        <Form.Item
          name="code"
          label={t('categories.code')}
          extra={t('categories.codeHelp')}
          rules={[
            requiredText(t('categories.codeRequired')),
            maxLen(32, t('categories.codeTooLong')),
            patternRule(CODE_PATTERN, t('categories.codeInvalid')),
          ]}
        >
          <Input autoCapitalize="off" spellCheck={false} />
        </Form.Item>
        <Form.Item name="nameZh" label={t('categories.nameZh')} rules={[requiredText(t('categories.nameRequired')), maxLen(64, t('categories.nameTooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item name="nameEn" label={t('categories.nameEn')} rules={[requiredText(t('categories.nameRequired')), maxLen(64, t('categories.nameTooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item name="icon" label={t('categories.icon')} extra={t('categories.iconHelp')} rules={[maxLen(32, t('categories.iconTooLong'))]}>
          <Input />
        </Form.Item>
        <Form.Item name="sortOrder" label={t('categories.sortOrder')} extra={t('categories.sortOrderHelp')}>
          <InputNumber precision={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
