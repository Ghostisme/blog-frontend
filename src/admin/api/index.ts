import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../api/client'
import { publicApi } from '../../api/public'
import type {
  AdminArticleQuery,
  AdminLoginResult,
  ArticleBatchRequest,
  ArticleEditView,
  ArticleListItem,
  ArticleSaveRequest,
  CategoryRequest,
  CategoryView,
  ImportResult,
  PageResult,
  ResumeContent,
  ResumeLang,
  TagRequest,
  TagView,
  TranslationBatchResult,
} from '../../types/api'

/** 批量导入要逐个文件解析入库，几百个文件会远超 client 默认的 20 秒超时，这里放宽到 5 分钟。 */
const IMPORT_TIMEOUT_MS = 300_000

/** 去掉值为空的查询参数，避免把 `keyword=` 这种空串发给后端。 */
function compact<T extends object>(query: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>
}

/**
 * 后台所有接口。统一放在这里：页面只依赖这一个对象，
 * 接口路径/方法变动只改这一处；与前台 publicApi 刻意分开，前台包里不会带上后台代码。
 */
export const adminApi = {
  // ---- 认证 ----
  login: (username: string, password: string) => apiPost<AdminLoginResult>('/api/admin/login', { username, password }),
  me: () => apiGet<AdminLoginResult>('/api/admin/me'),
  logout: () => apiPost<void>('/api/admin/logout'),

  // ---- 文章 ----
  listArticles: (query: AdminArticleQuery) =>
    apiGet<PageResult<ArticleListItem>>('/api/admin/articles', compact(query)),
  getArticle: (id: number) => apiGet<ArticleEditView>(`/api/admin/articles/${id}`),
  createArticle: (body: ArticleSaveRequest) => apiPost<ArticleEditView>('/api/admin/articles', body),
  updateArticle: (id: number, body: ArticleSaveRequest) =>
    apiPut<ArticleEditView>(`/api/admin/articles/${id}`, body),
  deleteArticle: (id: number) => apiDelete<void>(`/api/admin/articles/${id}`),
  /** 批量修改，返回实际更新篇数。 */
  patchArticles: (body: ArticleBatchRequest) => apiPatch<{ updated: number }>('/api/admin/articles', body),
  /** 批量删除。ids 由 client 序列化成 ids=1&ids=2，Spring 的 List<Long> 可直接绑定。 */
  deleteArticles: (ids: number[]) => apiDelete<{ deleted: number }>('/api/admin/articles', { ids }),
  importArticles: (files: File[]) => {
    // 字段名必须是 files（后端 @RequestParam("files")）。
    // 不手动设置 Content-Type：由浏览器根据 FormData 自动带上 multipart boundary，手写会丢 boundary 导致后端解析失败
    const form = new FormData()
    files.forEach((file) => form.append('files', file, file.name))
    return apiPost<ImportResult>('/api/admin/articles/import', form, { timeout: IMPORT_TIMEOUT_MS })
  },
  /** 从公开链接导入。每条都要出网，超时同样放宽到 5 分钟。 */
  importArticleUrls: (urls: string[]) =>
    apiPost<ImportResult>('/api/admin/articles/import-urls', { urls }, { timeout: IMPORT_TIMEOUT_MS }),
  backfillTranslations: () =>
    apiPost<TranslationBatchResult>('/api/admin/articles/translations/backfill', {}),

  // ---- 领域 ----
  listCategories: () => apiGet<CategoryView[]>('/api/admin/categories'),
  createCategory: (body: CategoryRequest) => apiPost<CategoryView>('/api/admin/categories', body),
  updateCategory: (id: number, body: CategoryRequest) => apiPut<CategoryView>(`/api/admin/categories/${id}`, body),
  deleteCategory: (id: number) => apiDelete<void>(`/api/admin/categories/${id}`),

  // ---- 标签（没有新增接口：标签随文章保存自动创建）----
  listTags: () => apiGet<TagView[]>('/api/admin/tags'),
  updateTag: (id: number, body: TagRequest) => apiPut<TagView>(`/api/admin/tags/${id}`, body),
  deleteTag: (id: number) => apiDelete<void>(`/api/admin/tags/${id}`),

  // ---- 简历 ----
  /** 读取走公开接口（后端没有单独的后台读取接口）。 */
  getResume: (lang: ResumeLang) => publicApi.getResume(lang),
  /** 整体覆盖保存，body 必须是完整内容。 */
  saveResume: (lang: ResumeLang, body: ResumeContent) => apiPut<ResumeContent>(`/api/admin/resume/${lang}`, body),
  /**
   * 解析简历 PDF，只返回结构化内容，不写入数据库。
   * 字段名必须是 file（后端 @RequestParam("file")）。
   */
  parseResumePdf: (file: File) => {
    const form = new FormData()
    form.append('file', file, file.name)
    return apiPost<ResumeContent>('/api/admin/resume/parse-pdf', form, { timeout: IMPORT_TIMEOUT_MS })
  },
}
