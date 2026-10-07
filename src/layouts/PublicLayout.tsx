import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import styles from './PublicLayout.module.css'

/**
 * 前台公共外壳：页头 + 内容 + 页脚。
 *
 * 路由切换时页面是懒加载的，第一次进入某页会有短暂等待。顶部的细进度条
 * 让用户知道“点击已生效、正在加载”，比页面毫无反应要好得多。
 */
export default function PublicLayout() {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <div className={styles.shell}>
      {/* 键盘用户第一次 Tab 就能跳过导航直达正文，平时不可见 */}
      <a className={styles.skip} href="#main">
        {t('common.skip')}
      </a>
      <div className={styles.progress} data-active={navigation.state === 'loading'} aria-hidden="true" />
      <Header />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
