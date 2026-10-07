import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminArticleQuery, ArticleBatchRequest, ArticleSaveRequest } from '../../types/api'
import { adminApi } from '../api'
import { adminKeys, invalidateContent } from '../api/keys'

/** 文章分页列表。keepPreviousData：翻页/切换筛选时保留旧数据直到新数据到达，表格不会闪成空白。 */
export const useAdminArticles = (query: AdminArticleQuery) =>
  useQuery({
    queryKey: adminKeys.articleList(query),
    queryFn: () => adminApi.listArticles(query),
    placeholderData: keepPreviousData,
    // 管理员刚改完回到列表要立刻看到结果；列表也不大，不缓存比缓存了被旧数据误导更划算
    staleTime: 0,
  })

/**
 * 单篇文章（编辑用）。每次挂载都强制拉最新并且离开即丢弃缓存：
 * 编辑表单只在首次拿到数据时初始化，若用缓存里的旧版本初始化，保存时会悄悄覆盖掉别处（如另一个标签页）的改动。
 */
export const useAdminArticle = (id: number | undefined) =>
  useQuery({
    queryKey: adminKeys.article(id ?? 0),
    queryFn: () => adminApi.getArticle(id as number),
    enabled: id !== undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

/** 新增或修改文章（有 id 即修改）。成功后让列表与前台缓存失效。 */
export function useSaveArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: ArticleSaveRequest }) =>
      id === undefined ? adminApi.createArticle(body) : adminApi.updateArticle(id, body),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useDeleteArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteArticle(id),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useBatchPatchArticles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ArticleBatchRequest) => adminApi.patchArticles(body),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useBatchDeleteArticles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => adminApi.deleteArticles(ids),
    onSuccess: () => invalidateContent(qc),
  })
}
