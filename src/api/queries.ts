import { keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query'
import type { ArticleQuery, ResumeLang } from '../types/api'
import { ApiError } from './client'
import { publicApi } from './public'

/**
 * 全局查询客户端。
 *
 * - staleTime 1 分钟：博客内容更新不频繁，来回切换页面不必每次都重新请求；
 * - 4xx 不重试：404/400 重试多少次结果都一样，只会让用户多等；网络抖动和 5xx 才值得重试一次；
 * - 关闭窗口聚焦刷新：阅读文章时切出去再切回来，页面不应该自己闪一下重新加载。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

export const queryKeys = {
  filters: ['filters'] as const,
  articles: (q: ArticleQuery) => ['articles', q] as const,
  article: (slug: string) => ['article', slug] as const,
  resume: (lang: ResumeLang) => ['resume', lang] as const,
}

export const useFilters = () => useQuery({ queryKey: queryKeys.filters, queryFn: publicApi.getFilters })

/** keepPreviousData：翻页 / 切换筛选时保留上一页内容直到新数据到达，列表不会闪成空白再跳回。 */
export const useArticles = (query: ArticleQuery) =>
  useQuery({
    queryKey: queryKeys.articles(query),
    queryFn: () => publicApi.listArticles(query),
    placeholderData: keepPreviousData,
  })

export const useArticle = (slug: string) =>
  useQuery({
    queryKey: queryKeys.article(slug),
    queryFn: () => publicApi.getArticle(slug),
    // 每次读取都会让后端浏览量 +1：不缓存，否则来回切换不会计数；但也不该因为组件重新挂载就多请求
    staleTime: Infinity,
    gcTime: 0,
  })

export const useResume = (lang: ResumeLang) =>
  useQuery({ queryKey: queryKeys.resume(lang), queryFn: () => publicApi.getResume(lang) })
