import dayjs, { type Dayjs } from 'dayjs'

/**
 * 后端 LocalDateTime 使用的格式：不带时区、不带毫秒。
 * 必须用方括号转义字面量 T，否则 dayjs 会把它当成格式符。
 * 刻意不用 toISOString()：它会转成 UTC 并带 Z 后缀，后端的 LocalDateTime 反序列化会直接报 400。
 */
const BACKEND_DATETIME = 'YYYY-MM-DD[T]HH:mm:ss'

/** 把日期选择器的值转成后端接受的字符串；未选择返回 null。 */
export function toBackendDateTime(value: Dayjs | null | undefined): string | null {
  return value && value.isValid() ? value.format(BACKEND_DATETIME) : null
}

/** 解析后端返回的时间；为空或无法解析返回 null（交给日期选择器显示为空）。 */
export function fromBackendDateTime(iso: string | null | undefined): Dayjs | null {
  if (!iso) {
    return null
  }
  const d = dayjs(iso)
  return d.isValid() ? d : null
}

/**
 * 列表里的“更新时间”。管理员需要精确到分钟（刚导入/刚改的文章排在最前，常要区分先后），
 * 所以不复用前台只到日期的 formatDate。中英文统一用数字格式，避免再维护一套语言分支。
 */
export function formatDateTime(iso: string | null | undefined): string {
  const d = fromBackendDateTime(iso)
  return d ? d.format('YYYY-MM-DD HH:mm') : ''
}
