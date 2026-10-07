import i18n from '../../i18n'
import { enUS } from './en-US'
import { zhCN } from './zh-CN'

/**
 * 把后台文案注册到独立的 'admin' 命名空间（不改动前台的 translation 命名空间）。
 * 后台模块是懒加载的，所以普通访客不会下载这些文案。
 *
 * - deep=true, overwrite=true：热更新或重复加载本模块时，用最新内容覆盖而不是保留旧文案；
 * - 组件里用 useTranslation('admin')。
 */
i18n.addResourceBundle('zh-CN', 'admin', zhCN, true, true)
i18n.addResourceBundle('en-US', 'admin', enUS, true, true)
