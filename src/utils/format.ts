import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

/**
 * 格式化日期。按参数指定语言而不是依赖 dayjs 的全局语言：
 * 全局设置在 ThemeProvider 的 effect 里才生效，首次渲染时可能还是旧值，会出现一帧错误格式。
 *
 * @param iso 后端返回的 ISO 时间（无时区的本地时间，如 2026-10-07T13:56:03）
 * @returns 格式化结果；输入为空或无法解析时返回空字符串
 */
export function formatDate(iso: string | null | undefined, language: string): string {
  if (!iso) {
    return ''
  }
  const d = dayjs(iso)
  if (!d.isValid()) {
    return ''
  }
  return language.startsWith('zh') ? d.locale('zh-cn').format('YYYY年M月D日') : d.locale('en').format('MMM D, YYYY')
}
