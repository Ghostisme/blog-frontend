/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 页脚展示的备案号，可选 */
  readonly VITE_ICP?: string
  /** 开发服务器代理的后端地址，仅 vite.config.ts 使用 */
  readonly VITE_DEV_API_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
