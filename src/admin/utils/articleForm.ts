import type { Dayjs } from 'dayjs'
import type { ArticleEditView, ArticleLevel, ArticleSaveRequest, ArticleStatus } from '../../types/api'
import { fromBackendDateTime, toBackendDateTime } from './datetime'

/** 后端单篇文章标签上限（ArticleSaveRequest.tags 的 @Size(max=10)）。 */
export const MAX_TAGS = 10

/**
 * 文章表单的值。与 API 结构分开定义：表单里需要 Dayjs、允许 undefined（antd 清空 Select 得到的是 undefined），
 * 而提交时要变成 null / 字符串，这些差异集中在本文件的两个转换函数里，组件不必关心。
 */
export interface ArticleFormValues {
  title: string
  slug: string
  summary: string
  content: string
  level: ArticleLevel
  categoryId?: number | null
  status: ArticleStatus
  tags: string[]
  sourceUrl: string
  sourceAuthor: string
  coverUrl: string
  publishedAt: Dayjs | null
}

/** 新建文章的初始值：草稿 + “进阶”，与后端对缺省值的处理一致。 */
export const EMPTY_ARTICLE_FORM: ArticleFormValues = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  level: 'INTERMEDIATE',
  categoryId: undefined,
  status: 'DRAFT',
  tags: [],
  sourceUrl: '',
  sourceAuthor: '',
  coverUrl: '',
  publishedAt: null,
}

/** 后端视图 → 表单值。空值统一成空字符串，避免受控输入在 null/字符串之间切换触发 React 警告。 */
export function toArticleFormValues(article: ArticleEditView): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? '',
    content: article.content,
    level: article.level,
    categoryId: article.categoryId,
    status: article.status,
    tags: article.tags,
    sourceUrl: article.sourceUrl ?? '',
    sourceAuthor: article.sourceAuthor ?? '',
    coverUrl: article.coverUrl ?? '',
    publishedAt: fromBackendDateTime(article.publishedAt),
  }
}

/** 空白字符串 → null。后端对可选字段也会 blankToNull，这里提前规整让请求体语义更明确。 */
const blankToNull = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * 标签去重：后端按 slug（大小写不敏感）去重，先出现者保留。
 * 前端提前按同样规则去重并截断，用户看到的保存结果才与提交内容一致。
 */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of tags) {
    const name = raw.trim()
    const key = name.toLowerCase()
    if (name && !seen.has(key)) {
      seen.add(key)
      result.push(name)
    }
  }
  return result.slice(0, MAX_TAGS)
}

/**
 * 表单值 → 提交请求。
 *
 * slug 留空时传 null：后端语义是“新增时按标题生成、修改时保持不变”，
 * 所以这里绝不能把空 slug 当作“清空”——编辑页留空 slug 不会改动已有链接。
 */
export function toArticleSaveRequest(values: ArticleFormValues): ArticleSaveRequest {
  return {
    title: values.title.trim(),
    slug: blankToNull(values.slug),
    summary: blankToNull(values.summary),
    content: values.content,
    level: values.level,
    categoryId: values.categoryId ?? null,
    status: values.status,
    tags: normalizeTags(values.tags),
    sourceUrl: blankToNull(values.sourceUrl),
    sourceAuthor: blankToNull(values.sourceAuthor),
    coverUrl: blankToNull(values.coverUrl),
    publishedAt: toBackendDateTime(values.publishedAt),
  }
}
