import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '../types/api'

/**
 * 接口调用失败。统一成这一种错误类型，页面只需要关心 status 和 message，
 * 不必区分“网络断了”“后端返回 4xx”“后端返回 5xx”各自是什么形状。
 */
export class ApiError extends Error {
  /** HTTP 状态码；网络层失败（没有响应）时为 0 */
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * 登录态过期时的回调，由后台的 AuthProvider 注册。
 * 用回调而不是在这里直接跳转：client 层不应该依赖路由，也让前台公开页面完全不涉及登录逻辑。
 */
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

/** 这几个后台接口返回 401 是“正常业务结果”（没登录 / 口令错），不应触发全局的“登录已过期”处理。 */
const AUTH_PROBE_PATHS = ['/api/admin/login', '/api/admin/me', '/api/admin/logout']

const http = axios.create({
  // 同源部署：生产由 Nginx 把 /api 反代到后端，开发由 Vite 代理，所以用相对路径即可
  baseURL: '',
  timeout: 20_000,
  // 数组参数序列化成 ids=1,2,3（Spring 的 List<Long> 直接可绑定），而不是 ids[]=1&ids[]=2
  paramsSerializer: { indexes: null },
})

http.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw error
    }
    const err = error as AxiosError<Partial<ApiEnvelope<unknown>>>
    const status = err.response?.status ?? 0
    // 优先用后端给的 message（已是面向用户的中文提示）；没有则按场景兜底
    const message = err.response?.data?.message ?? (status === 0 ? '网络连接失败' : `请求失败 (${status})`)

    const url = err.config?.url ?? ''
    if (status === 401 && url.startsWith('/api/admin') && !AUTH_PROBE_PATHS.includes(url)) {
      unauthorizedHandler?.()
    }
    throw new ApiError(status, message)
  },
)

/** 发请求并直接返回 data：所有接口都是 {code,message,data} 包装，页面不需要每次手动拆。 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await http.request<ApiEnvelope<T>>(config)
  return res.data.data
}

export const apiGet = <T>(url: string, params?: object) => request<T>({ method: 'GET', url, params })
export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ method: 'POST', url, data, ...config })
export const apiPut = <T>(url: string, data?: unknown) => request<T>({ method: 'PUT', url, data })
export const apiPatch = <T>(url: string, data?: unknown) => request<T>({ method: 'PATCH', url, data })
export const apiDelete = <T>(url: string, params?: object) => request<T>({ method: 'DELETE', url, params })
