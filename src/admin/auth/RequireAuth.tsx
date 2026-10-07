import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RouteFallback } from '../../components/RouteFallback'
import { ADMIN_LOGIN } from '../utils/redirect'
import { useAuth } from './AuthContext'

/**
 * 受保护路由的守卫：未登录跳登录页并记住来源，登录后回跳（见 LoginPage）。
 * 来源带上 search，这样从带筛选条件的文章列表过期掉线，重新登录后仍回到同样的筛选结果。
 */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <RouteFallback />
  }
  if (status === 'anonymous') {
    return <Navigate to={ADMIN_LOGIN} replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return <Outlet />
}
