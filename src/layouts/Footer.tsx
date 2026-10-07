import { useTranslation } from 'react-i18next'
import { SITE } from '../config/site'
import styles from './Footer.module.css'

/** 在模块加载时取一次即可；放在组件里每次渲染都调用 Date 属于渲染期副作用，也没有必要。 */
const YEAR = new Date().getFullYear()

/** 页脚。备案号仅在构建时配置了 VITE_ICP 才显示。 */
export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <strong className="gradient-text">{SITE.name}</strong>
          <p className={styles.tagline}>{t('site.tagline')}</p>
        </div>
        <div className={styles.right}>
          <p>
            © {YEAR} {SITE.domain} · {t('footer.rights')}
          </p>
          <p>{t('footer.builtWith')}</p>
          {SITE.icp && (
            <p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
                {SITE.icp}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
