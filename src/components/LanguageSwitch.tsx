import { GlobalOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'
import type { AppLanguage } from '../i18n/language'

/**
 * 中 / 英一键切换。只有两种语言，用“点一下切到另一种”比下拉菜单少一次点击；
 * 按钮上显示的是【切换目标】的简称，与用户的直觉（点它就变成那个）一致。
 */
export function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  const isZh = i18n.language.startsWith('zh')
  const target: AppLanguage = isZh ? 'en-US' : 'zh-CN'

  return (
    <Tooltip title={t('lang.switchTo')}>
      <Button type="text" aria-label={t('lang.switchTo')} icon={<GlobalOutlined />} onClick={() => changeLanguage(target)}>
        {isZh ? 'EN' : '中'}
      </Button>
    </Tooltip>
  )
}
