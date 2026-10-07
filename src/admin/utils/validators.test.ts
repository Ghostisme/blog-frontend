import { describe, expect, it } from 'vitest'
import { CODE_PATTERN, HTTP_URL_PATTERN, SLUG_PATTERN, patternRule } from './validators'

describe('backend-aligned patterns', () => {
  it('SLUG_PATTERN: lowercase alnum separated by single hyphens, or empty', () => {
    for (const ok of ['', 'a', 'spring-boot-3a9f12cd', 'a1-b2']) expect(SLUG_PATTERN.test(ok)).toBe(true)
    for (const bad of ['Hello', 'a_b', '-a', 'a-', 'a--b', 'a b', '中文']) expect(SLUG_PATTERN.test(bad)).toBe(false)
  })

  it('CODE_PATTERN: non-empty lowercase alnum and hyphens', () => {
    for (const ok of ['frontend', 'a-1', '-', '--']) expect(CODE_PATTERN.test(ok)).toBe(true)
    for (const bad of ['', 'Front', 'a_b', 'a b']) expect(CODE_PATTERN.test(bad)).toBe(false)
  })

  it('HTTP_URL_PATTERN: http(s) only, or empty', () => {
    for (const ok of ['', 'http://a.b', 'https://a.b/c?d=1']) expect(HTTP_URL_PATTERN.test(ok)).toBe(true)
    for (const bad of ['javascript:alert(1)', 'ftp://a.b', 'a.b', 'https://', 'https://a b', 'data:text/html,x'])
      expect(HTTP_URL_PATTERN.test(bad)).toBe(false)
  })
})

describe('patternRule', () => {
  const rule = patternRule(HTTP_URL_PATTERN, 'bad') as { validator: (r: unknown, v: unknown) => Promise<void> }

  it('validates the trimmed value, because the value is trimmed before it is submitted', async () => {
    await expect(rule.validator({}, '  https://a.b  ')).resolves.toBeUndefined()
  })

  it('rejects an invalid value with the given message', async () => {
    await expect(rule.validator({}, 'javascript:alert(1)')).rejects.toThrow('bad')
  })

  it('ignores non-string values such as undefined (optional field never filled)', async () => {
    await expect(rule.validator({}, undefined)).resolves.toBeUndefined()
  })
})
