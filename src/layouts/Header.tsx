import { MenuOutlined } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { ThemeToggle } from '../components/ThemeToggle'
import { SITE } from '../config/site'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/articles', key: 'nav.articles', end: false },
  { to: '/resume', key: 'nav.resume', end: false },
] as const

/** 吸顶页头：品牌、主导航、语言 / 主题切换；窄屏下导航收进抽屉。 */
export function Header() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const links = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        onClick={onNavigate}
      >
        {t(item.key)}
      </NavLink>
    ))

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label={SITE.name}>
          <span className={styles.logo} aria-hidden="true">D</span>
          <span className={styles.name}>{SITE.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {links()}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitch />
          <ThemeToggle />
          <Button
            className={styles.menuButton}
            type="text"
            shape="circle"
            aria-label={t('nav.menu')}
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      <Drawer title={SITE.name} placement="right" size={260} open={open} onClose={() => setOpen(false)}>
        <nav className={styles.drawerNav} aria-label="Mobile">
          {links(() => setOpen(false))}
        </nav>
      </Drawer>
    </header>
  )
}
