import { describe, expect, it } from 'vitest'
import { resolveLanguage, toResumeLang } from './language'

describe('resolveLanguage', () => {
  it('prefers the language the user chose before', () => {
    expect(resolveLanguage('en-US', 'zh-CN')).toBe('en-US')
    expect(resolveLanguage('zh-CN', 'en-US')).toBe('zh-CN')
  })

  it('ignores a stored value that is not a supported language', () => {
    expect(resolveLanguage('fr-FR', 'en-GB')).toBe('en-US')
  })

  it('maps every Chinese browser variant to Simplified Chinese', () => {
    for (const nav of ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'ZH-cn']) {
      expect(resolveLanguage(null, nav)).toBe('zh-CN')
    }
  })

  it('falls back to English for everything else', () => {
    expect(resolveLanguage(null, 'ja-JP')).toBe('en-US')
    expect(resolveLanguage(null, undefined)).toBe('en-US')
  })
})

describe('toResumeLang', () => {
  it('maps UI language to the resume language', () => {
    expect(toResumeLang('zh-CN')).toBe('zh')
    expect(toResumeLang('en-US')).toBe('en')
  })
})
