import { useTranslation } from 'react-i18next'

/** 带中英文名称的实体（领域、标签）。 */
interface Bilingual {
  nameZh: string
  nameEn: string
}

/**
 * 按当前界面语言选取名称。
 * 后端把中英文名都返回，由前端挑选：切换语言时无需重新请求数据。
 */
export function useLocalizedName(): (item: Bilingual) => string {
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  return (item) => (zh ? item.nameZh : item.nameEn)
}
