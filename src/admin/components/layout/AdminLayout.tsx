import { Drawer } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { AdminHeader } from './AdminHeader'
import { Brand } from './Brand'
import { SideNav } from './SideNav'
import styles from './layout.module.css'

/** 与 layout.module.css 里的断点保持一致：≥992px 常驻侧栏，以下改为抽屉。 */
const DESKTOP_QUERY = '(min-width: 992px)'

/** 后台外壳：宽屏常驻侧边栏，窄屏侧边栏收进抽屉；页面内容渲染在 <Outlet />。 */
export default function AdminLayout() {
  const { t } = useTranslation('admin')
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wasDesktop, setWasDesktop] = useState(isDesktop)

  // 从窄屏拉宽到宽屏时抽屉会随之卸载，但 open 状态还是 true；
  // 不复位的话再缩回窄屏，抽屉会自己突然弹出来。
  // 用“渲染期间调整 state”而不是 effect：这是对视口变化的派生，不涉及外部系统，
  // effect 会多渲染一轮，还会让抽屉在复位前闪现一帧
  if (wasDesktop !== isDesktop) {
    setWasDesktop(isDesktop)
    if (isDesktop) {
      setDrawerOpen(false)
    }
  }

  // 后台页面标题统一；离开后台时还原，前台页面自己管理标题
  useEffect(() => {
    const previous = document.title
    document.title = t('documentTitle')
    return () => {
      document.title = previous
    }
  }, [t])

  return (
    <div className={styles.shell}>
      {isDesktop && (
        <aside className={styles.sider} aria-label={t('nav.label')}>
          <Brand />
          <SideNav />
        </aside>
      )}
      <div className={styles.main}>
        <AdminHeader onOpenMenu={isDesktop ? undefined : () => setDrawerOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      {!isDesktop && (
        <Drawer
          open={drawerOpen}
          placement="left"
          size={260}
          title={<Brand />}
          closable={{ 'aria-label': t('nav.close') }}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0 }, header: { padding: 0 } }}
        >
          <SideNav onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}
    </div>
  )
}
