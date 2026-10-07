import { ARTICLE_LEVELS, type ArticleLevel, type ArticleQuery } from '../types/api'

/** 前台文章列表的每页条数。 */
export const PAGE_SIZE = 12

const MAX_KEYWORD_LENGTH = 100

/**
 * 文章列表的筛选状态。
 *
 * 状态只存在于 URL 的 query string 里（没有单独的 React state）：
 * 这样刷新页面、浏览器前进后退、把链接发给别人，看到的都是同一个筛选结果。
 */
export interface FilterState {
  page: number
  level?: ArticleLevel
  categoryId?: number
  tagId?: number
  keyword: string
  sort: 'LATEST' | 'HOT'
}

export const DEFAULT_FILTERS: FilterState = { page: 1, keyword: '', sort: 'LATEST' }

function positiveInt(raw: string | null): number | undefined {
  if (raw === null || !/^\d+$/.test(raw)) {
    return undefined
  }
  const n = Number(raw)
  return Number.isSafeInteger(n) && n > 0 ? n : undefined
}

/**
 * 从 URL 参数解析筛选状态。URL 是用户可以随手改的输入，所以任何非法值
 * （level=foo、page=-3、page=abc）都静默回退到默认，而不是让页面报错。
 */
export function parseFilters(params: URLSearchParams): FilterState {
  const level = params.get('level')
  return {
    page: positiveInt(params.get('page')) ?? 1,
    level: ARTICLE_LEVELS.find((l) => l === level),
    categoryId: positiveInt(params.get('category')),
    tagId: positiveInt(params.get('tag')),
    keyword: (params.get('q') ?? '').trim().slice(0, MAX_KEYWORD_LENGTH),
    sort: params.get('sort') === 'HOT' ? 'HOT' : 'LATEST',
  }
}

/** 把筛选状态写回 URL 参数。等于默认值的项不写，保持链接简短。 */
export function toSearchParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.level) params.set('level', state.level)
  if (state.categoryId) params.set('category', String(state.categoryId))
  if (state.tagId) params.set('tag', String(state.tagId))
  if (state.keyword) params.set('q', state.keyword)
  if (state.sort !== 'LATEST') params.set('sort', state.sort)
  if (state.page > 1) params.set('page', String(state.page))
  return params
}

/** 筛选状态 → 后端查询参数。 */
export function toQuery(state: FilterState): ArticleQuery {
  return {
    page: state.page,
    size: PAGE_SIZE,
    level: state.level,
    categoryId: state.categoryId,
    tagId: state.tagId,
    keyword: state.keyword || undefined,
    sort: state.sort,
  }
}

/** 是否有任何生效的筛选条件（翻页和排序不算筛选）。 */
export function hasActiveFilters(state: FilterState): boolean {
  return Boolean(state.level || state.categoryId || state.tagId || state.keyword)
}
