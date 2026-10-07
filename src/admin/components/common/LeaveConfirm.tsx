import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Blocker } from 'react-router-dom'

/**
 * “有未保存的修改，确定离开？”确认框，配合 useUnsavedGuard 返回的 blocker 使用。
 * 完全由 blocker 状态驱动：路由被拦下（blocked）时弹出，“离开”放行，“留下”取消这次跳转。
 */
export function LeaveConfirm({ blocker }: { blocker: Blocker }) {
  const { t } = useTranslation('admin')
  const blocked = blocker.state === 'blocked'
  return (
    <Modal
      open={blocked}
      title={t('unsaved.title')}
      okText={t('unsaved.leave')}
      cancelText={t('unsaved.stay')}
      okButtonProps={{ danger: true }}
      onOk={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
      maskClosable={false}
      centered
    >
      {t('unsaved.content')}
    </Modal>
  )
}
