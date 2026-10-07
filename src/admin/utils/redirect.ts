/** 登录后默认进入的页面。 */
export const ADMIN_HOME = '/admin/articles'

export const ADMIN_LOGIN = '/admin/login'

/**
 * 从路由 state 里取出登录后的回跳地址，并做安全校验。
 *
 * location.state 来自历史记录，类型上是 unknown，理论上可以被构造成任意值；
 * 只接受 /admin 下、且不是登录页本身的站内路径——否则既可能把人跳到站外（开放重定向），
 * 也可能在登录页和自身之间来回跳转。
 */
export function resolveRedirectTarget(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from
  if (typeof from !== 'string') {
    return ADMIN_HOME
  }
  const isAdminPath = from === '/admin' || from.startsWith('/admin/')
  // "//" 开头的会被浏览器当作协议相对的外站地址
  const isLogin = from === ADMIN_LOGIN || from.startsWith(`${ADMIN_LOGIN}?`) || from.startsWith(`${ADMIN_LOGIN}/`)
  return isAdminPath && !isLogin && !from.startsWith('//') ? from : ADMIN_HOME
}
