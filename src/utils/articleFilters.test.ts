import { describe, expect, it } from 'vitest'
import { hasActiveFilters, parseFilters, toQuery, toSearchParams, type FilterState } from './articleFilters'

const parse = (qs: string) => parseFilters(new URLSearchParams(qs))

describe('parseFilters', () => {
  it('returns defaults for an empty query string', () => {
    expect(parse('')).toEqual({
      page: 1,
      level: undefined,
      categoryId: undefined,
      tagId: undefined,
      keyword: '',
      sort: 'LATEST',
    })
  })

  it('reads every supported parameter', () => {
    const s = parse('level=ADVANCED&category=3&tag=9&q=spring&sort=HOT&page=4')

    expect(s).toMatchObject({ level: 'ADVANCED', categoryId: 3, tagId: 9, keyword: 'spring', sort: 'HOT', page: 4 })
  })

  it('ignores invalid values instead of throwing', () => {
    const s = parse('level=NOPE&category=-1&tag=abc&page=0&sort=WAT')

    expect(s.level).toBeUndefined()
    expect(s.categoryId).toBeUndefined()
    expect(s.tagId).toBeUndefined()
    expect(s.page).toBe(1)
    expect(s.sort).toBe('LATEST')
  })

  it('rejects numbers that are not safe integers', () => {
    expect(parse('page=99999999999999999999').page).toBe(1)
  })

  it('trims and caps the keyword', () => {
    expect(parse('q=%20%20hi%20%20').keyword).toBe('hi')
    expect(parse(`q=${'a'.repeat(500)}`).keyword).toHaveLength(100)
  })
})

describe('toSearchParams', () => {
  it('omits values equal to the defaults so links stay short', () => {
    const state: FilterState = { page: 1, keyword: '', sort: 'LATEST' }

    expect(toSearchParams(state).toString()).toBe('')
  })

  it('round-trips through parseFilters', () => {
    const state: FilterState = { page: 3, level: 'EXPERT', categoryId: 2, tagId: 5, keyword: '微服务', sort: 'HOT' }

    expect(parseFilters(toSearchParams(state))).toEqual(state)
  })
})

describe('toQuery', () => {
  it('maps empty keyword to undefined so it is not sent to the backend', () => {
    expect(toQuery({ page: 2, keyword: '', sort: 'LATEST' }).keyword).toBeUndefined()
  })
})

describe('hasActiveFilters', () => {
  it('does not count paging or sorting as filtering', () => {
    expect(hasActiveFilters({ page: 5, keyword: '', sort: 'HOT' })).toBe(false)
  })

  it('counts level, category, tag and keyword', () => {
    expect(hasActiveFilters({ page: 1, keyword: 'x', sort: 'LATEST' })).toBe(true)
    expect(hasActiveFilters({ page: 1, keyword: '', sort: 'LATEST', level: 'BEGINNER' })).toBe(true)
  })
})
