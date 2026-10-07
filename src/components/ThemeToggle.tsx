import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeContext'

/** 深浅色切换。按钮只有图标，所以 aria-label 必须有，屏幕阅读器才知道它是干什么的。 */
export function ThemeToggle() {
  const { t } = useTranslation()
  const { mode, toggle } = useTheme()
  const label = mode === 'dark' ? t('theme.toLight') : t('theme.toDark')

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        aria-label={label}
        icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
      />
    </Tooltip>
  )
}
