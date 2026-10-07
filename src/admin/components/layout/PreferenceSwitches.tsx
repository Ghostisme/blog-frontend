import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../../../i18n'
import type { AppLanguage } from '../../../i18n/language'
import { useTheme } from '../../../theme/ThemeContext'

/**
 * 语言 + 深浅色切换。登录页和后台顶栏共用：没登录时也要能切换，
 * 否则在英文环境下看到中文登录页的人没有办法自救。
 */
export function PreferenceSwitches() {
  const { t, i18n } = useTranslation('admin')
  const { mode, toggle } = useTheme()
  const language: AppLanguage = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US'

  return (
    <>
      <Segmented<AppLanguage>
        size="small"
        aria-label={t('prefs.language')}
        value={language}
        onChange={changeLanguage}
        options={[
          { value: 'zh-CN', label: '中文' },
          { value: 'en-US', label: 'EN' },
        ]}
      />
      <Button
        type="text"
        shape="circle"
        aria-label={mode === 'dark' ? t('prefs.toLight') : t('prefs.toDark')}
        icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
      />
    </>
  )
}
