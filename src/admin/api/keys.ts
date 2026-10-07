import type { QueryClient } from '@tanstack/react-query'
import type { AdminArticleQuery, ResumeLang } from '../../types/api'

/**
 * 后台 queryKey 统一以 'admin' 开头，与前台的 ['articles'] / ['filters'] 等互不相干。
 * 文章列表与单篇详情用两个不同的前缀（article-list / article）：
 * queryKey 是按前缀匹配失效的，若详情挂在列表前缀下，失效列表时会连带波及正在编辑的那一篇。
 */
export const adminKeys = {
  articleLists: ['admin', 'article-list'] as const,
  articleList: (q: AdminArticleQuery) => ['admin', 'article-list', q] as const,
  article: (id: number) => ['admin', 'article', id] as const,
  categories: ['admin', 'categories'] as const,
  tags: ['admin', 'tags'] as const,
  resume: (lang: ResumeLang) => ['admin', 'resume', lang] as const,
}

/**
 * 文章 / 领域 / 标签发生变化后，让相关缓存失效。
 *
 * - 后台列表、领域、标签：管理页面自己要刷新；
 * - 前台 ['filters'] ['articles'] ['article']：前台用 1 分钟 staleTime，不失效的话
 *   管理员刚发布的文章在前台要等缓存过期才能看到。
 *
 * 刻意不失效 adminKeys.article(id)（单篇编辑数据）：编辑页只在挂载时用它初始化表单，
 * 保存后重新拉取既无必要，也不应该影响用户正在编辑的内容；下次进入编辑页会强制重新请求。
 *
 * 不 await：调用方不必等列表重新拉取完才给用户反馈。
 */
export function invalidateContent(qc: QueryClient): void {
  void qc.invalidateQueries({ queryKey: adminKeys.articleLists })
  void qc.invalidateQueries({ queryKey: adminKeys.categories })
  void qc.invalidateQueries({ queryKey: adminKeys.tags })
  void qc.invalidateQueries({ queryKey: ['filters'] })
  void qc.invalidateQueries({ queryKey: ['articles'] })
  void qc.invalidateQueries({ queryKey: ['article'] })
}

/** 简历保存后：前台 ['resume', lang] 需要失效，后台缓存由保存逻辑直接写入。 */
export function invalidatePublicResume(qc: QueryClient, lang: ResumeLang): void {
  void qc.invalidateQueries({ queryKey: ['resume', lang] })
}
