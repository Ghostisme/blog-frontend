import { ARTICLE_LEVELS, type AdminArticleQuery, type ArticleLevel, type ArticleSort, type ArticleStatus } from '../../types/api'

/** 后台列表默认每页条数；与后端 AdminArticleQuery 的默认值一致。 */
export const DEFAULT_PAGE_SIZE = 20

/** 后端允许的每页条数上限是 100，分页器的可选项不要超过它。 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const STATUSES: readonly ArticleStatus[] = ['DRAFT', 'PUBLISHED']
const SORTS: readonly ArticleSort[] = ['UPDATED', 'LATEST', 'HOT']

/** 把 URL 里的字符串收窄成合法的枚举值；不合法一律当作“未筛选”，不让脏链接把后端打成 400。 */
function pick<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((v) => v === raw)
}

function positiveInt(raw: string | null): number | undefined {
  if (raw === null || !/^\d+$/.test(raw)) {
    return undefined
  }
  const n = Number(raw)
  return Number.isSafeInteger(n) && n > 0 ? n : undefined
}

/**
 * URL 查询串 → 列表查询参数。
 * 筛选条件放在 URL 而不是组件 state：刷新/前进后退/分享链接都能还原现场，
 * 导入页也能直接链接到 `?status=DRAFT`。
 */
export function parseArticleQuery(params: URLSearchParams): AdminArticleQuery {
  const keyword = params.get('keyword')?.trim()
  return {
    page: positiveInt(params.get('page')) ?? 1,
    size: Math.min(positiveInt(params.get('size')) ?? DEFAULT_PAGE_SIZE, 100),
    status: pick(params.get('status'), STATUSES),
    level: pick<ArticleLevel>(params.get('level'), ARTICLE_LEVELS),
    categoryId: positiveInt(params.get('categoryId')),
    keyword: keyword ? keyword : undefined,
    sort: pick(params.get('sort'), SORTS) ?? 'UPDATED',
  }
}

/** 列表查询参数 → URL 查询串。只写入与默认值不同的项，让地址栏保持干净。 */
export function buildArticleSearchParams(query: AdminArticleQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.page && query.page > 1) params.set('page', String(query.page))
  if (query.size && query.size !== DEFAULT_PAGE_SIZE) params.set('size', String(query.size))
  if (query.status) params.set('status', query.status)
  if (query.level) params.set('level', query.level)
  if (query.categoryId) params.set('categoryId', String(query.categoryId))
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.sort && query.sort !== 'UPDATED') params.set('sort', query.sort)
  return params
}

/** 是否有任何筛选条件（不含分页与排序），用来决定是否显示“清除筛选”。 */
export function hasActiveFilters(query: AdminArticleQuery): boolean {
  return Boolean(query.status || query.level || query.categoryId || query.keyword)
}
