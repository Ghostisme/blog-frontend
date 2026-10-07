import { describe, expect, it } from 'vitest'
import { ARTICLE_LEVELS } from '../../types/api'
import { enUS } from './en-US'
import { zhCN } from './zh-CN'

/** 嵌套对象 → { 'a.b.c': '文案' }。 */
function flatten(obj: object, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      acc[path] = value
    } else {
      Object.assign(acc, flatten(value as object, path))
    }
    return acc
  }, {})
}

const zh = flatten(zhCN)
const en = flatten(enUS)

// 读取 src/admin 下所有源码（排除测试与文案文件本身），扫描字面量翻译 key
const sources = import.meta.glob(['../**/*.ts', '../**/*.tsx', '!../**/*.test.ts', '!../i18n/**'], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const usedKeys = new Set<string>()
for (const code of Object.values(sources)) {
  for (const match of code.matchAll(/\bt\(\s*'([^']+)'/g)) {
    usedKeys.add(match[1])
  }
}

const placeholders = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort()

describe('admin i18n bundles', () => {
  it('scans a meaningful number of source files and keys (guards against a broken glob)', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(30)
    expect(usedKeys.size).toBeGreaterThan(150)
  })

  it('zh-CN and en-US have exactly the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })

  it('has no empty translations', () => {
    for (const [key, text] of [...Object.entries(zh), ...Object.entries(en)]) {
      expect(text.trim(), key).not.toBe('')
    }
  })

  it('uses the same interpolation placeholders in both languages', () => {
    for (const key of Object.keys(zh)) {
      expect(placeholders(en[key]), key).toEqual(placeholders(zh[key]))
    }
  })

  it('defines every translation key that the code references', () => {
    const missing = [...usedKeys].filter((key) => !(key in zh))
    expect(missing).toEqual([])
  })

  it('has no plural-suffixed keys (they would make zh/en key parity impossible)', () => {
    expect(Object.keys(zh).filter((k) => /_(one|other|zero|two|few|many)$/.test(k))).toEqual([])
  })
})

describe('dynamic key families', () => {
  it.each(ARTICLE_LEVELS)('level.%s exists', (level) => {
    expect(zh[`level.${level}`]).toBeTruthy()
  })

  it.each(['DRAFT', 'PUBLISHED'])('status.%s exists', (status) => {
    expect(zh[`status.${status}`]).toBeTruthy()
  })

  it.each(['IMPORTED', 'SKIPPED', 'FAILED'])('import.status.%s exists', (status) => {
    expect(zh[`import.status.${status}`]).toBeTruthy()
  })

  it.each(['UPDATED', 'LATEST', 'HOT'])('articles.sort.%s exists', (sort) => {
    expect(zh[`articles.sort.${sort}`]).toBeTruthy()
  })
})
