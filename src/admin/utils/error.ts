import { ApiError } from '../../api/client'

/**
 * 取出可直接展示给用户的错误文案。
 *
 * 后端对 4xx 返回的 message 已经是面向用户的中文提示（如“有 3 篇文章尚未设置领域，无法发布”、
 * “该领域下仍有文章…”），所以 ApiError 一律优先用它；非 ApiError（代码 bug 等）才回退到调用方给的通用文案，
 * 避免把 "Cannot read properties of undefined" 这类内部信息直接弹给管理员。
 */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError && error.message ? error.message : fallback
}

/** 是否为指定 HTTP 状态的接口错误。用于把 409（标识重复）等错误精确挂到对应表单字段上。 */
export function isApiStatus(error: unknown, status: number): error is ApiError {
  return error instanceof ApiError && error.status === status
}
