/** 站点级常量。 */
export const SITE = {
  name: 'DarkRich',
  domain: 'blog.darkrich.com',
  /** 备案号，构建时由 VITE_ICP 注入；未设置则页脚不显示 */
  icp: import.meta.env.VITE_ICP,
} as const
