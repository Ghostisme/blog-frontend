import type { FormRule } from 'antd'

/*
 * 表单校验规则。与后端 jakarta.validation 的约束逐项对齐（见各 *Request.java），
 * 前端先拦住明显错误，后端仍是最终裁判——这里的规则只能比后端更严或相等，不能更松。
 */

/** http(s) 链接或留空。与后端 @Pattern("^(https?://\\S+)?$") 一致。 */
export const HTTP_URL_PATTERN = /^(https?:\/\/\S+)?$/

/** 文章标识：小写字母/数字，以单个连字符分隔；允许留空（留空表示自动生成/保持不变）。 */
export const SLUG_PATTERN = /^([a-z0-9]+(-[a-z0-9]+)*)?$/

/** 领域编码：后端规则 ^[a-z0-9-]+$，不允许留空。 */
export const CODE_PATTERN = /^[a-z0-9-]+$/

/** 字符串长度上限。注意 antd 与 Java 的 @Size 都按 UTF-16 码元计数，一致。 */
export const maxLen = (max: number, message: string): FormRule => ({ max, message })

/**
 * 按正则校验的规则，校验前先 trim。
 * 管理员从别处粘贴链接时常带首尾空白，而保存时我们也会 trim 后再提交，
 * 所以校验必须看 trim 之后的值，否则会出现“看起来对却报格式错误”。
 * 用自定义 validator 而不是 pattern 规则，正是因为 pattern 规则无法预处理值。
 */
export function patternRule(pattern: RegExp, message: string): FormRule {
  return {
    validator: (_rule, value: unknown) =>
      typeof value !== 'string' || pattern.test(value.trim()) ? Promise.resolve() : Promise.reject(new Error(message)),
  }
}

/** 必填且不能全是空白（antd 的 required 会放过 "   "）。 */
export const requiredText = (message: string): FormRule => ({ required: true, whitespace: true, message })

/** 字符串数组的逐项校验：每项非空白且不超过长度上限（对应后端 List<@NotBlank @Size(max)>）。 */
export function eachItemRule(max: number, tooLong: string): FormRule {
  return {
    validator: (_rule, value: unknown) => {
      const items = Array.isArray(value) ? (value as unknown[]) : []
      const bad = items.some((item) => typeof item === 'string' && item.trim().length > max)
      return bad ? Promise.reject(new Error(tooLong)) : Promise.resolve()
    },
  }
}
