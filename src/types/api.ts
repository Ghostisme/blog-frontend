/**
 * 与后端 DTO 一一对应的类型定义。
 * 后端用 Java record，字段名经 Jackson 原样输出为 camelCase，这里保持同名，
 * 改后端结构时只需同步这一个文件。
 */

/** 统一响应体；code 与 HTTP 状态码一致，成功为 200。 */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

// ---------------------------------------------------------------- 文章

export type ArticleLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type ArticleStatus = 'DRAFT' | 'PUBLISHED'
export type ArticleSort = 'LATEST' | 'HOT' | 'UPDATED'

/** 与后端枚举声明顺序一致（入门 → 资深），用于渲染固定顺序的等级入口。 */
export const ARTICLE_LEVELS: readonly ArticleLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export interface CategoryBrief {
  id: number
  code: string
  nameZh: string
  nameEn: string
  icon: string | null
}

export interface TagBrief {
  id: number
  slug: string
  nameZh: string
  nameEn: string
}

/** 列表项（不含正文）。前台与后台列表共用。 */
export interface ArticleListItem {
  id: number
  slug: string
  title: string
  summary: string | null
  level: ArticleLevel
  category: CategoryBrief | null
  tags: TagBrief[]
  coverUrl: string | null
  viewCount: number
  readingMinutes: number
  status: ArticleStatus
  publishedAt: string | null
  updatedAt: string
}

export interface ArticleNav {
  id: number
  slug: string
  title: string
}

export interface ArticleDetail {
  id: number
  slug: string
  title: string
  summary: string | null
  content: string
  level: ArticleLevel
  category: CategoryBrief | null
  tags: TagBrief[]
  coverUrl: string | null
  sourceUrl: string | null
  sourceAuthor: string | null
  viewCount: number
  wordCount: number
  readingMinutes: number
  publishedAt: string | null
  updatedAt: string
  /** 时间上更早的一篇 */
  older: ArticleNav | null
  /** 时间上更晚的一篇 */
  newer: ArticleNav | null
}

export interface CategoryView {
  id: number
  code: string
  nameZh: string
  nameEn: string
  icon: string | null
  sortOrder: number
  articleCount: number
}

export interface TagView {
  id: number
  slug: string
  nameZh: string
  nameEn: string
  articleCount: number
}

export interface FilterOptions {
  levels: { level: ArticleLevel; count: number }[]
  categories: CategoryView[]
  tags: TagView[]
}

/** 前台列表查询参数。 */
export interface ArticleQuery {
  page?: number
  size?: number
  level?: ArticleLevel
  categoryId?: number
  tagId?: number
  keyword?: string
  sort?: 'LATEST' | 'HOT'
}

// ---------------------------------------------------------------- 简历

export interface ResumeLink {
  label: string
  url: string
}

export interface ResumeBasics {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  avatarUrl: string
  links: ResumeLink[]
}

export interface ResumeSkillGroup {
  name: string
  items: string[]
}

export interface ResumeExperience {
  company: string
  position: string
  period: string
  location: string
  highlights: string[]
}

export interface ResumeProject {
  name: string
  role: string
  period: string
  description: string
  techStack: string[]
  highlights: string[]
  url: string
}

export interface ResumeEducation {
  school: string
  degree: string
  major: string
  period: string
}

export interface ResumeContent {
  basics: ResumeBasics
  summary: string
  skills: ResumeSkillGroup[]
  experience: ResumeExperience[]
  projects: ResumeProject[]
  education: ResumeEducation[]
}

/** 简历语言；与界面语言(zh-CN/en-US)相互独立，可通过 ?lang= 单独指定。 */
export type ResumeLang = 'zh' | 'en'

// ---------------------------------------------------------------- 后台

export interface AdminLoginResult {
  username: string
}

/** 后台编辑用的文章全量视图。 */
export interface ArticleEditView {
  id: number
  slug: string
  title: string
  summary: string | null
  content: string
  level: ArticleLevel
  categoryId: number | null
  status: ArticleStatus
  tags: string[]
  sourceUrl: string | null
  sourceAuthor: string | null
  coverUrl: string | null
  viewCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** 新增 / 修改文章的请求体。slug 为空：新增时自动生成，修改时保持不变。 */
export interface ArticleSaveRequest {
  title: string
  slug?: string | null
  summary?: string | null
  content: string
  level?: ArticleLevel
  categoryId?: number | null
  status?: ArticleStatus
  tags?: string[]
  sourceUrl?: string | null
  sourceAuthor?: string | null
  coverUrl?: string | null
  publishedAt?: string | null
}

export interface AdminArticleQuery {
  page?: number
  size?: number
  status?: ArticleStatus
  level?: ArticleLevel
  categoryId?: number
  keyword?: string
  sort?: ArticleSort
}

/** 批量修改：status / level / categoryId 为空表示不改该项，至少给一项。 */
export interface ArticleBatchRequest {
  ids: number[]
  status?: ArticleStatus
  level?: ArticleLevel
  categoryId?: number
}

export interface CategoryRequest {
  code: string
  nameZh: string
  nameEn: string
  icon?: string | null
  sortOrder?: number | null
}

export interface TagRequest {
  nameZh: string
  nameEn: string
}

export type ImportStatus = 'IMPORTED' | 'SKIPPED' | 'FAILED'

export interface ImportItem {
  fileName: string
  status: ImportStatus
  title: string | null
  articleId: number | null
  message: string
}

export interface ImportResult {
  total: number
  imported: number
  skipped: number
  failed: number
  items: ImportItem[]
}
