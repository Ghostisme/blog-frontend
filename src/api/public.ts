import type {
  ArticleContentLanguage,
  ArticleDetail,
  ArticleListItem,
  ArticleQuery,
  FilterOptions,
  PageResult,
  ResumeContent,
  ResumeLang,
} from '../types/api'
import { apiGet } from './client'

/** 前台（公开）接口。后台接口在 admin/api 下，二者刻意分开，前台包里不会带上任何后台代码。 */
export const publicApi = {
  listArticles: (query: ArticleQuery) => apiGet<PageResult<ArticleListItem>>('/api/articles', query),
  getArticle: (slug: string, lang: ArticleContentLanguage) =>
    apiGet<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`, { lang }),
  getFilters: () => apiGet<FilterOptions>('/api/filters'),
  getResume: (lang: ResumeLang) => apiGet<ResumeContent>('/api/resume', { lang }),
}
