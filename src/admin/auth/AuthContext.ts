import { createContext, useContext } from 'react'

/** loading：启动时正在向后端确认登录态；此时既不能放行也不能跳登录页，否则已登录用户刷新会闪一下登录页。 */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  username: string | null
  /** 登录失败时抛出 ApiError（含 429 锁定），由调用方展示 message。 */
  login: (username: string, password: string) => Promise<void>
  /** 登出失败（如网络断了）时抛出：此时服务端 Cookie 仍有效，不能假装已登出。 */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** 单独放在 Context 文件而非 Provider 同文件：组件文件同时导出 Hook 会破坏 Fast Refresh。 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return ctx
}
