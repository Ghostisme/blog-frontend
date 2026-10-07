import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api'
import { invalidateContent } from '../api/keys'

/**
 * 上传 Markdown 批量导入。
 * 即使部分文件失败，HTTP 层面仍是 200（逐文件结果在 body 里），所以无论如何都要让列表缓存失效：
 * 只要有一篇导入成功，文章管理页和前台筛选数据就都变了。
 */
export function useImportArticles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => adminApi.importArticles(files),
    onSuccess: () => invalidateContent(qc),
  })
}

/** 从公开链接导入。成功后同样让文章列表缓存失效。 */
export function useImportArticleUrls() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (urls: string[]) => adminApi.importArticleUrls(urls),
    onSuccess: () => invalidateContent(qc),
  })
}
