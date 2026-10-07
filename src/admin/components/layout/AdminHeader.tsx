import { GlobalOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Dropdown } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthContext'
import { useErrorToast } from '../../hooks/useErrorToast'
import { PreferenceSwitches } from './PreferenceSwitches'
import styles from './layout.module.css'

interface AdminHeaderProps {
  /** 窄屏下显示汉堡按钮；宽屏传 undefined 则不渲染。 */
  onOpenMenu?: () => void
}

/** 后台顶栏：语言、深浅色、查看站点、当前用户与退出。 */
export function AdminHeader({ onOpenMenu }: AdminHeaderProps) {
  const { t } = useTranslation('admin')
  const { modal } = App.useApp()
  const { username, logout } = useAuth()
  const toastError = useErrorToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const confirmLogout = () =>
    modal.confirm({
      title: t('auth.logoutConfirmTitle'),
      content: t('auth.logoutConfirmContent'),
      okText: t('auth.logout'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoggingOut(true)
        try {
          await logout()
        } catch (error) {
          // 登出失败（多半是断网）时服务端 Cookie 仍有效，保持在后台并如实告知，而不是假装已退出
          toastError(error, t('auth.logoutFailed'))
        } finally {
          setLoggingOut(false)
        }
      },
    })

  return (
    <header className={styles.header}>
      {onOpenMenu && (
        <Button type="text" aria-label={t('nav.open')} icon={<MenuOutlined />} onClick={onOpenMenu} />
      )}
      <div className={styles.headerSpacer} />
      <PreferenceSwitches />
      {/* 新标签页打开：保留后台当前页（尤其是写了一半的文章），并且不会触发“未保存”拦截 */}
      <Button
        type="text"
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        icon={<GlobalOutlined />}
        aria-label={t('header.viewSite')}
      >
        <span className={styles.hideOnMobile}>{t('header.viewSite')}</span>
      </Button>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [{ key: 'logout', icon: <LogoutOutlined />, label: t('auth.logout'), danger: true }],
          onClick: confirmLogout,
        }}
      >
        <Button type="text" loading={loggingOut} icon={<UserOutlined />} aria-label={t('header.account')}>
          <span className={styles.hideOnMobile}>{username}</span>
        </Button>
      </Dropdown>
    </header>
  )
}
