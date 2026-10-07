import { useTranslation } from 'react-i18next'
import styles from './layout.module.css'

/** 侧栏/抽屉顶部的品牌标识。 */
export function Brand() {
  const { t } = useTranslation('admin')
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true" />
      <span className="gradient-text">{t('brand')}</span>
    </div>
  )
}
