import { describe, expect, it } from 'vitest'
import { buildArticleSearchParams, hasActiveFilters, parseArticleQuery } from './articleQuery'

const parse = (qs: string) => parseArticleQuery(new URLSearchParams(qs))

describe('parseArticleQuery', () => {
  it('uses defaults for an empty query string', () => {
    expect(parse('')).toEqual({
      page: 1,
      size: 20,
      status: undefined,
      level: undefined,
      categoryId: undefined,
      keyword: undefined,
      sort: 'UPDATED',
    })
  })

  it('reads valid filters, including the DRAFT link used by the import page', () => {
    const q = parse('status=DRAFT&level=EXPERT&categoryId=7&keyword=%20spring%20&page=3&size=50&sort=HOT')
    expect(q).toMatchObject({ status: 'DRAFT', level: 'EXPERT', categoryId: 7, keyword: 'spring', page: 3, size: 50, sort: 'HOT' })
  })

  it('drops invalid enum values instead of forwarding them to the backend', () => {
    const q = parse('status=HACKED&level=nope&sort=RANDOM')
    expect(q.status).toBeUndefined()
    expect(q.level).toBeUndefined()
    expect(q.sort).toBe('UPDATED')
  })

  it('rejects non-numeric, zero and negative numbers', () => {
    expect(parse('page=abc').page).toBe(1)
    expect(parse('page=0').page).toBe(1)
    expect(parse('page=-2').page).toBe(1)
    expect(parse('categoryId=1.5').categoryId).toBeUndefined()
    expect(parse('categoryId=0').categoryId).toBeUndefined()
  })

  it('caps page size at the backend limit of 100', () => {
    expect(parse('size=5000').size).toBe(100)
  })

  it('treats a blank keyword as no keyword', () => {
    expect(parse('keyword=%20%20').keyword).toBeUndefined()
  })
})

describe('buildArticleSearchParams', () => {
  it('omits values equal to the defaults to keep the URL clean', () => {
    expect(buildArticleSearchParams({ page: 1, size: 20, sort: 'UPDATED' }).toString()).toBe('')
  })

  it('round-trips a full query', () => {
    const query = parse('status=PUBLISHED&level=ADVANCED&categoryId=2&keyword=vue&page=4&size=10&sort=LATEST')
    expect(parse(buildArticleSearchParams(query).toString())).toEqual(query)
  })
})

describe('hasActiveFilters', () => {
  it('ignores paging and sorting', () => {
    expect(hasActiveFilters({ page: 3, size: 50, sort: 'HOT' })).toBe(false)
  })

  it('detects any filter', () => {
    expect(hasActiveFilters({ status: 'DRAFT' })).toBe(true)
    expect(hasActiveFilters({ keyword: 'x' })).toBe(true)
    expect(hasActiveFilters({ categoryId: 1 })).toBe(true)
  })
})
