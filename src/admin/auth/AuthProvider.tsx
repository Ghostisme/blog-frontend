import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { setUnauthorizedHandler } from '../../api/client'
import { adminApi } from '../api'
import { errorMessage, isApiStatus } from '../utils/error'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

interface AuthState {
  status: AuthStatus
  username: string | null
}

/**
 * 后台登录态。
 *
 * 令牌在 HttpOnly Cookie 里，前端读不到，所以“是否已登录”只能问后端（GET /me）；
 * 这里只保存判定结果，不保存任何凭据。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()
  const qc = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading', username: null })
  // 401 回调是在请求拦截器里触发的，拿到的 state 可能是闭包里的旧值，所以另存一份 ref 做“是否仍为已登录”的判断
  const statusRef = useRef<AuthStatus>('loading')

  const apply = useCallback((status: AuthStatus, username: string | null = null) => {
    statusRef.current = status
    setState({ status, username })
  }, [])

  // 探测失败时的提示。用 useEffectEvent 包起来，使下面的探测 effect 不依赖 t / message：
  // 否则在登录页切换界面语言会让 t 变化，从而重新请求 /me 并可能重复弹出错误提示。
  const reportProbeFailure = useEffectEvent((error: unknown) => {
    void message.error(errorMessage(error, t('auth.probeFailed')))
  })

  // 启动时确认登录态。任何失败都按未登录处理（去登录页重新登录总是安全的），
  // 但非 401（断网、后端 5xx）要告诉用户原因，否则会误以为是“账号掉线”。
  useEffect(() => {
    let ignore = false
    adminApi
      .me()
      .then((me) => !ignore && apply('authenticated', me.username))
      .catch((error: unknown) => {
        if (ignore) {
          return
        }
        apply('anonymous')
        if (!isApiStatus(error, 401)) {
          reportProbeFailure(error)
        }
      })
    return () => {
      ignore = true
    }
  }, [apply])

  // 登录态过期：清状态 → RequireAuth 自动跳登录页。
  // 一个页面同时发出多个请求时会连续收到多个 401，只有第一次（此时仍是已登录）才处理，避免重复弹提示。
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (statusRef.current === 'authenticated') {
        apply('anonymous')
        void message.warning(t('auth.sessionExpired'))
      }
    })
    return () => setUnauthorizedHandler(null)
  }, [apply, message, t])

  // 变为未登录（登出 / 过期）后清掉后台缓存，防止下一次登录（甚至换账号）时先闪出上一次的数据。
  // 放在 effect 里而不是登出回调里：等页面卸载后再清，否则仍挂载的查询会被“清空”并立刻重新请求。
  useEffect(() => {
    if (state.status === 'anonymous') {
      qc.removeQueries({ queryKey: ['admin'] })
    }
  }, [state.status, qc])

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await adminApi.login(username, password)
      apply('authenticated', result.username)
    },
    [apply],
  )

  const logout = useCallback(async () => {
    await adminApi.logout()
    apply('anonymous')
  }, [apply])

  const value = useMemo<AuthContextValue>(
    () => ({ status: state.status, username: state.username, login, logout }),
    [state, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
