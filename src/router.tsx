import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RouteFallback } from './components/RouteFallback'
import PublicLayout from './layouts/PublicLayout'

/**
 * 路由表。页面全部用 lazy 按路由拆包：首屏只下载当前页需要的代码，
 * 文章详情页才会加载 Markdown 渲染器，后台页面更是只有登录管理员才会下载。
 *
 * 后台 `/admin/*` 作为独立分支挂在公共布局之外：它有自己的布局、鉴权和子路由，
 * 在 admin/AdminApp 内部用 <Routes> 处理，这里只负责把整块懒加载进来。
 */
const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    // 首次进入时首屏路由分块尚未加载完，React Router 需要一个占位；缺少它会在控制台告警
    HydrateFallback: RouteFallback,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/Home')).default }) },
      { path: 'articles', lazy: async () => ({ Component: (await import('./pages/Articles')).default }) },
      { path: 'articles/:slug', lazy: async () => ({ Component: (await import('./pages/ArticleDetail')).default }) },
      { path: 'resume', lazy: async () => ({ Component: (await import('./pages/Resume')).default }) },
      { path: '*', lazy: async () => ({ Component: (await import('./pages/NotFound')).default }) },
    ],
  },
  {
    path: 'admin/*',
    lazy: async () => ({ Component: (await import('./admin/AdminApp')).default }),
    HydrateFallback: RouteFallback,
  },
]

export const router = createBrowserRouter(routes)
