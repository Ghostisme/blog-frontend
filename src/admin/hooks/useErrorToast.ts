import { App } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessage } from '../utils/error'

/**
 * 返回一个“弹出错误提示”的函数：优先展示 ApiError.message（后端给的中文原因），
 * 没有则用 fallback（通常是 t('common.operationFailed') 之类的通用文案）。
 * 封装起来是因为几乎每个异步操作的 catch 分支都要做同样的事。
 */
export function useErrorToast(): (error: unknown, fallback?: string) => void {
  const { message } = App.useApp()
  const { t } = useTranslation('admin')
  return useCallback(
    (error, fallback) => {
      void message.error(errorMessage(error, fallback ?? t('common.operationFailed')))
    },
    [message, t],
  )
}
