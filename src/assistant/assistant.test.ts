import { describe, expect, it } from 'vitest'
import { publicAssistantPath, tableCsv } from './navigation'
import { applyAssistantEvent, conversationHistory } from './state'
import { SseDecoder } from './stream'
import type { AssistantEvent, AssistantTurn } from './types'

const turn = (): AssistantTurn => ({ id: 'test', question: 'hello', sequence: 0, status: 'RUNNING', parts: [] })
const event = (id: number, type: string, data: AssistantEvent['data']): AssistantEvent => ({ id, type, data })
describe('assistant streaming protocol', () => {
  it('handles split CRLF, comments and multiline JSON data', () => {
    const parser = new SseDecoder()
    expect(parser.push(': heartbeat\r')).toEqual([])
    expect(parser.push('\n\r\nid: 2\r\nevent: text_delta\r\ndata: {"id":"part",\r\n')).toEqual([])
    expect(parser.push('data: "text":"你好"}\r\n\r\n')).toEqual([event(2, 'text_delta', { id: 'part', text: '你好' })])
  })
  it('decodes Chinese across real UTF-8 byte boundaries', () => {
    const bytes = new TextEncoder().encode('id: 1\nevent: text_delta\ndata: {"id":"p","text":"小R助手"}\n\n')
    const decoder = new TextDecoder()
    const parser = new SseDecoder()
    const received: AssistantEvent[] = []
    for (const byte of bytes) received.push(...parser.push(decoder.decode(new Uint8Array([byte]), { stream: true })))
    expect(received[0].data.text).toBe('小R助手')
  })
  it('reassembles several events in one network chunk', () => {
    expect(new SseDecoder().push('id: 1\nevent: meta\ndata: {"runId":"a"}\n\nid: 2\nevent: done\ndata: {"status":"COMPLETED"}\n\n')).toHaveLength(2)
  })
  it('rejects invalid event IDs and oversized unfinished frames', () => {
    expect(() => new SseDecoder().push('id: x\ndata: {}\n\n')).toThrow()
    expect(() => new SseDecoder().push('x'.repeat(150_001))).toThrow()
  })
})
describe('assistant state and checkpoints', () => {
  it('ignores repeated events when reconnecting', () => {
    const first = applyAssistantEvent(turn(), event(1, 'text_delta', { id: 'p', text: 'Hello' }))
    expect(applyAssistantEvent(first, event(1, 'text_delta', { id: 'p', text: 'Hello' }))).toBe(first)
    expect(applyAssistantEvent(first, event(2, 'text_delta', { id: 'p', text: ' world' })).parts).toEqual([{ type: 'text', id: 'p', text: 'Hello world' }])
  })
  it('preserves ordered text, document and follow-up text', () => {
    let result = applyAssistantEvent(turn(), event(1, 'text_delta', { id: 'p1', text: 'A' }))
    result = applyAssistantEvent(result, event(2, 'block', { id: 'doc', type: 'document', title: 'Notes', content: '# Notes' }))
    result = applyAssistantEvent(result, event(3, 'text_delta', { id: 'p2', text: 'B' }))
    expect(result.parts.map(p => p.id)).toEqual(['p1', 'doc', 'p2'])
  })
  it('records replayed navigation as a link without claiming it was executed', () => {
    expect(applyAssistantEvent(turn(), event(1, 'navigation', { path: '/resume', label: 'Resume' }), true).parts).toEqual([
      { type: 'navigation', id: 'nav-1', path: '/resume', label: 'Resume', executed: false },
    ])
  })
  it('waits for a human choice and resolves only the matching approval', () => {
    let state = applyAssistantEvent(turn(), event(1, 'approval', { id: 'approval', title: 'Download?', kind: 'download', options: [{ id: 'yes', label: 'Yes' }] }))
    state = applyAssistantEvent(state, event(2, 'done', { status: 'WAITING' }))
    expect(state.status).toBe('WAITING')
    state = applyAssistantEvent(state, event(3, 'decision', { approvalId: 'other', label: 'Yes' }))
    expect(state.approval?.resolved).toBeUndefined()
    expect(applyAssistantEvent(state, event(4, 'decision', { approvalId: 'approval', label: 'Yes' })).approval?.resolved).toBe('Yes')
  })
  it('sends bounded plain conversation history, without failed replies or protocol roles', () => {
    const turns = Array.from({ length: 10 }, (_, i): AssistantTurn => ({ ...turn(), id: String(i), status: 'COMPLETED', question: 'q'.repeat(4000), parts: [{ type: 'text', id: 'p', text: 'a'.repeat(9000) }] }))
    const history = conversationHistory([...turns, { ...turn(), status: 'FAILED' }])
    expect(history).toHaveLength(8)
    expect(history.every(m => m.content.length <= 2800 && ['user', 'assistant'].includes(m.role))).toBe(true)
  })
})
describe('assistant browser actions', () => {
  it('allows public blog routes and supported filters', () => {
    for (const path of ['/', '/articles', '/articles/react-hooks', '/resume?lang=en', '/articles?category=2&keyword=React']) expect(publicAssistantPath(path)).toBe(path)
  })
  it('rejects external, admin, encoded-slash and redirect destinations', () => {
    for (const path of ['https://example.com', '//example.com', '/admin', '/articles/%2fadmin', '/resume?redirect=https://example.com', '/articles/x#script', '/articles\\admin']) expect(publicAssistantPath(path)).toBeUndefined()
  })
  it('quotes CSV fields and neutralizes spreadsheet formulas', () => {
    const csv = tableCsv(['name', 'value'], [['a,"b', '=HYPERLINK("bad")'], ['safe', 20]])
    expect(csv).toContain('"a,""b"')
    expect(csv).toContain('"\'=HYPERLINK')
    expect(csv.startsWith('\uFEFF')).toBe(true)
  })
})
