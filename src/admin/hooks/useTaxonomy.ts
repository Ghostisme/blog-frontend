import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoryRequest, TagRequest } from '../../types/api'
import { adminApi } from '../api'
import { adminKeys, invalidateContent } from '../api/keys'

/** 领域列表（含文章数，含草稿）。文章筛选、编辑页下拉、领域管理页共用同一份缓存。 */
export const useAdminCategories = () =>
  useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.listCategories, staleTime: 30_000 })

export const useAdminTags = () =>
  useQuery({ queryKey: adminKeys.tags, queryFn: adminApi.listTags, staleTime: 30_000 })

/** 新增（无 id）或修改（有 id）领域。 */
export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: CategoryRequest }) =>
      id === undefined ? adminApi.createCategory(body) : adminApi.updateCategory(id, body),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: TagRequest }) => adminApi.updateTag(id, body),
    onSuccess: () => invalidateContent(qc),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteTag(id),
    onSuccess: () => invalidateContent(qc),
  })
}
