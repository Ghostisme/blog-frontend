import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteFallback } from '../components/RouteFallback'
// 副作用导入：把后台文案注册到 i18n 的 'admin' 命名空间。必须在任何页面渲染之前完成
import './i18n/register'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import AdminLayout from './components/layout/AdminLayout'
import { ADMIN_HOME } from './utils/redirect'
import ArticlesPage from './pages/ArticlesPage'
import LoginPage from './pages/LoginPage'

// 列表页和登录页随入口一起加载；编辑器（含 Markdown 预览相关代码）、导入、简历、领域、标签都是低频页面，按需加载
const ArticleEditPage = lazy(() => import('./pages/ArticleEditPage'))
const ImportPage = lazy(() => import('./pages/ImportPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const TagsPage = lazy(() => import('./pages/TagsPage'))
const ResumePage = lazy(() => import('./pages/ResumePage'))

/**
 * 后台入口。路由表以 `admin/*` 懒加载本组件，这里用 <Routes> 处理 /admin 下的全部子路由。
 * 子路由必须写成【相对路径】（login、articles …）：后代 <Routes> 匹配的是去掉父级前缀 /admin 之后的剩余路径，
 * 写成 /admin/login 这样的绝对路径永远匹配不上，页面会渲染成空白且没有任何报错。
 * 跳转目标（Navigate 的 to）仍用绝对路径，那是完整 URL，不受此影响。
 *
 * AuthProvider 放在这里而不是根上：前台访客完全不会加载任何后台代码，也不会去请求 /api/admin/me。
 */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to={ADMIN_HOME} replace />} />
              <Route path="articles" element={<ArticlesPage />} />
              {/* new 必须在 :id 之前声明，否则会被当成文章 id */}
              <Route path="articles/new" element={<ArticleEditPage />} />
              <Route path="articles/:id" element={<ArticleEditPage />} />
              <Route path="import" element={<ImportPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="*" element={<Navigate to={ADMIN_HOME} replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
