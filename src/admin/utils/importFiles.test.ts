import { describe, expect, it } from 'vitest'
import { MAX_FILE_BYTES, formatBytes, isMarkdownName, rejectReason } from './importFiles'

describe('isMarkdownName', () => {
  it('accepts .md and .markdown in any case', () => {
    expect(isMarkdownName('a.md')).toBe(true)
    expect(isMarkdownName('A.MD')).toBe(true)
    expect(isMarkdownName('note.Markdown')).toBe(true)
  })

  it('rejects other extensions and look-alikes', () => {
    expect(isMarkdownName('a.txt')).toBe(false)
    expect(isMarkdownName('a.md.exe')).toBe(false)
    expect(isMarkdownName('md')).toBe(false)
    expect(isMarkdownName('a.mdx')).toBe(false)
  })
})

describe('rejectReason', () => {
  it('passes a normal markdown file', () => {
    expect(rejectReason({ name: 'a.md', size: 1024 })).toBeNull()
  })

  it('rejects wrong types first', () => {
    expect(rejectReason({ name: 'a.png', size: 1 })).toBe('type')
  })

  it('rejects files above the 5MB backend limit but allows exactly 5MB', () => {
    expect(rejectReason({ name: 'a.md', size: MAX_FILE_BYTES + 1 })).toBe('size')
    expect(rejectReason({ name: 'a.md', size: MAX_FILE_BYTES })).toBeNull()
  })

  it('lets empty files through so the backend can report them per file', () => {
    expect(rejectReason({ name: 'a.md', size: 0 })).toBeNull()
  })
})

describe('formatBytes', () => {
  it('formats B / KB / MB', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
