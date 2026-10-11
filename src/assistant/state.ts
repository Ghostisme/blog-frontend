import type { Approval, AssistantEvent, AssistantTurn, DocumentPart, RichPart, RunStatus } from './types'

const STATUSES: RunStatus[] = ['RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED']
export function applyAssistantEvent(turn: AssistantTurn, event: AssistantEvent, replay = false): AssistantTurn {
  if (event.id <= turn.sequence) return turn
  const next = { ...turn, sequence: event.id }
  const d = event.data
  switch (event.type) {
    case 'meta': next.runId = String(d.runId); break
    case 'status': next.activity = String(d.label); break
    case 'text_delta': {
      const id = String(d.id)
      const part = next.parts.find(p => p.type === 'text' && p.id === id)
      next.parts = part ? next.parts.map(p => p === part && p.type === 'text' ? { ...p, text: p.text + String(d.text) } : p)
        : [...next.parts, { type: 'text', id, text: String(d.text) }]
      break
    }
    case 'block': {
      if (typeof d.id === 'string' && ['articles', 'table', 'chart', 'document'].includes(String(d.type))) {
        const part = d as unknown as RichPart
        if (!next.parts.some(p => p.id === part.id)) next.parts = [...next.parts, part]
      }
      break
    }
    case 'navigation': next.parts = [...next.parts, { type: 'navigation', id: `nav-${event.id}`, path: String(d.path), label: String(d.label), executed: !replay }]; break
    case 'approval': next.approval = d as unknown as Approval; break
    case 'decision': if (next.approval && next.approval.id === d.approvalId) next.approval = { ...next.approval, resolved: String(d.label) }; break
    case 'error': next.error = String(d.message); break
    case 'done': if (STATUSES.includes(d.status as RunStatus)) { next.status = d.status as RunStatus; next.activity = undefined }; break
  }
  return next
}
export function documentFrom(turn: AssistantTurn, id: string): DocumentPart | undefined {
  return turn.parts.find((p): p is DocumentPart => p.type === 'document' && p.id === id)
}
export function conversationHistory(turns: AssistantTurn[]): { role: 'user' | 'assistant'; content: string }[] {
  return turns.filter(t => t.status === 'COMPLETED').slice(-4).flatMap(turn => {
    const text = turn.parts.map(p => {
      if (p.type === 'text') return p.text
      if (p.type === 'document') return `[文档 ${p.id}] ${p.title}\n${p.content}`
      if (p.type === 'articles') return p.items.map(i => i.title + ': ' + i.path).join('\n')
      if (p.type === 'table') return p.title + '\n' + p.columns.join(' | ') + '\n' + p.rows.map(r => r.join(' | ')).join('\n')
      if (p.type === 'chart') return p.title + '\n' + p.values.map(v => v.label + ': ' + v.value).join('\n')
      return p.label + ': ' + p.path
    }).join('\n').slice(0, 2800)
    return [{ role: 'user' as const, content: turn.question.slice(0, 2800) }, ...(text ? [{ role: 'assistant' as const, content: text }] : [])]
  })
}
