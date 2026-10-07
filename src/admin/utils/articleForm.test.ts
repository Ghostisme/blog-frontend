import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { ArticleEditView } from '../../types/api'
import { EMPTY_ARTICLE_FORM, MAX_TAGS, normalizeTags, toArticleFormValues, toArticleSaveRequest } from './articleForm'

const view: ArticleEditView = {
  id: 1,
  slug: 'hello-1a2b3c4d',
  title: 'Hello',
  summary: null,
  content: '# hi',
  level: 'ADVANCED',
  categoryId: 3,
  status: 'PUBLISHED',
  tags: ['Vue', 'React'],
  sourceUrl: null,
  sourceAuthor: null,
  coverUrl: null,
  viewCount: 9,
  publishedAt: '2026-10-07T13:56:03',
  createdAt: '2026-10-01T10:00:00',
  updatedAt: '2026-10-07T13:56:03',
}

describe('toArticleFormValues', () => {
  it('turns nulls into empty strings so controlled inputs stay controlled', () => {
    const v = toArticleFormValues(view)
    expect(v.summary).toBe('')
    expect(v.sourceUrl).toBe('')
    expect(v.sourceAuthor).toBe('')
    expect(v.coverUrl).toBe('')
  })

  it('parses the backend local date-time', () => {
    expect(toArticleFormValues(view).publishedAt?.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-10-07 13:56:03')
  })
})

describe('toArticleSaveRequest', () => {
  it('sends a blank slug as null so an edit keeps the existing slug', () => {
    expect(toArticleSaveRequest({ ...toArticleFormValues(view), slug: '   ' }).slug).toBeNull()
  })

  it('trims text and turns blank optionals into null', () => {
    const req = toArticleSaveRequest({
      ...EMPTY_ARTICLE_FORM,
      title: '  T  ',
      content: 'body',
      summary: '  ',
      sourceUrl: ' https://a.b/c ',
      sourceAuthor: '',
    })
    expect(req.title).toBe('T')
    expect(req.summary).toBeNull()
    expect(req.sourceUrl).toBe('https://a.b/c')
    expect(req.sourceAuthor).toBeNull()
  })

  it('formats publishedAt without a timezone suffix (LocalDateTime cannot parse "Z")', () => {
    const req = toArticleSaveRequest({ ...EMPTY_ARTICLE_FORM, title: 't', content: 'c', publishedAt: dayjs('2026-01-02T03:04:05') })
    expect(req.publishedAt).toBe('2026-01-02T03:04:05')
  })

  it('sends null when no publish time or category is chosen', () => {
    const req = toArticleSaveRequest({ ...EMPTY_ARTICLE_FORM, title: 't', content: 'c', categoryId: undefined })
    expect(req.publishedAt).toBeNull()
    expect(req.categoryId).toBeNull()
  })

  it('keeps the content untouched (no trimming of leading indentation)', () => {
    expect(toArticleSaveRequest({ ...EMPTY_ARTICLE_FORM, title: 't', content: '    code\n' }).content).toBe('    code\n')
  })
})

describe('normalizeTags', () => {
  it('trims, drops blanks and de-duplicates case-insensitively keeping the first spelling', () => {
    expect(normalizeTags([' Vue ', 'vue', '', '  ', 'React', 'VUE'])).toEqual(['Vue', 'React'])
  })

  it('caps the list at the backend maximum', () => {
    const many = Array.from({ length: MAX_TAGS + 5 }, (_, i) => `t${i}`)
    expect(normalizeTags(many)).toHaveLength(MAX_TAGS)
  })
})
