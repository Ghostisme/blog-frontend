import {
  ApartmentOutlined,
  FileTextOutlined,
  IdcardOutlined,
  TagsOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Menu, type MenuProps } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

/** 菜单项 key 即路由路径，选中态直接由当前路径前缀推出。 */
const NAV_PATHS = ['/admin/articles', '/admin/import', '/admin/categories', '/admin/tags', '/admin/resume'] as const

interface SideNavProps {
  /** 点击菜单项后的回调。抽屉模式下用它关闭抽屉。 */
  onNavigate?: () => void
}

/** 后台侧边导航。 */
export function SideNav({ onNavigate }: SideNavProps) {
  const { t } = useTranslation('admin')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // 文案在渲染时才取，这样切换语言能立即生效；t() 用字面量 key 便于静态检查翻译是否缺失
  const items = useMemo<MenuProps['items']>(
    () => [
      { key: NAV_PATHS[0], icon: <FileTextOutlined />, label: t('nav.articles') },
      { key: NAV_PATHS[1], icon: <UploadOutlined />, label: t('nav.import') },
      { key: NAV_PATHS[2], icon: <ApartmentOutlined />, label: t('nav.categories') },
      { key: NAV_PATHS[3], icon: <TagsOutlined />, label: t('nav.tags') },
      { key: NAV_PATHS[4], icon: <IdcardOutlined />, label: t('nav.resume') },
    ],
    [t],
  )

  // 用前缀匹配：/admin/articles/12 编辑页也应高亮“文章”。
  // 导入页路径是 /admin/import 而非 /admin/articles/import，所以不会互相误匹配。
  const selected = NAV_PATHS.find((p) => pathname === p || pathname.startsWith(`${p}/`))

  return (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={selected ? [selected] : []}
      style={{ background: 'transparent', borderInlineEnd: 0 }}
      onClick={({ key }) => {
        navigate(key)
        onNavigate?.()
      }}
    />
  )
}
