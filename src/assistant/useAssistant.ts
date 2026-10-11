import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError, apiGet } from '../api/client'
import { downloadText, publicAssistantPath } from './navigation'
import { applyAssistantEvent, conversationHistory, documentFrom } from './state'
import { assistantStream } from './stream'
import type { AssistantCopy } from './copy'
import type { AssistantEvent, AssistantTurn } from './types'

const STORAGE = 'little-r-conversation-v1'
interface Snapshot { token: string; turns: AssistantTurn[] }
function initial(): Snapshot {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE) ?? 'null') as Snapshot | null
    if (saved && /^[a-f0-9]{64}$/.test(saved.token) && Array.isArray(saved.turns)
      && saved.turns.every(t => typeof t.id === 'string' && typeof t.question === 'string' && Array.isArray(t.parts))) return saved
  } catch { /* Private browsing or a full storage quota: continue in this tab's memory. */ }
  return { token: (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', ''), turns: [] }
}

export function useAssistant(lang: 'zh' | 'en', copy: AssistantCopy) {
  const [snapshot, setSnapshot] = useState(initial)
  const current = useRef(snapshot)
  const [busy, setBusy] = useState(false)
  const [available, setAvailable] = useState<boolean>()
  const active = useRef<AbortController | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const mounted = useRef(true)
  const commit = useCallback((fn: (s: Snapshot) => Snapshot) => {
    const next = fn(current.current)
    current.current = next
    if (mounted.current) setSnapshot(next)
    try { sessionStorage.setItem(STORAGE, JSON.stringify(next)) } catch { /* The active reply remains available in memory. */ }
  }, [])
  const update = useCallback((id: string, fn: (turn: AssistantTurn) => AssistantTurn) => {
    commit(s => ({ ...s, turns: s.turns.map(t => t.id === id ? fn(t) : t) }))
  }, [commit])

  const event = useCallback((id: string, packet: AssistantEvent, replay: boolean) => {
    const previous = current.current.turns.find(t => t.id === id)
    if (!previous || packet.id <= previous.sequence) return
    update(id, t => applyAssistantEvent(t, packet, replay))
    // Persist sequence BEFORE executing a browser action. Replayed actions are shown as links only.
    if (!replay && packet.type === 'navigation') {
      const path = publicAssistantPath(String(packet.data.path))
      if (path) void navigate(path)
    }
    if (!replay && packet.type === 'action' && packet.data.type === 'download') {
      const turn = current.current.turns.find(t => t.id === id)
      const doc = turn && documentFrom(turn, String(packet.data.documentId))
      if (doc) downloadText(doc.title, doc.content)
    }
  }, [navigate, update])

  const consume = useCallback(async (id: string, path: string, body?: unknown, initiallyReplay = false) => {
    const controller = new AbortController()
    active.current?.abort()
    active.current = controller
    setBusy(true)
    let error: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const turn = current.current.turns.find(t => t.id === id)
        if (!turn) break
        const replay = initiallyReplay || attempt > 0
        const url = attempt === 0 ? path : `/api/assistant/runs/${turn.runId}/events?after=${turn.sequence}`
        await assistantStream(url, current.current.token, controller.signal, p => event(id, p, replay), attempt === 0 ? body : undefined)
        error = undefined
        break
      } catch (err) {
        if (controller.signal.aborted) break
        error = err
        const turn = current.current.turns.find(t => t.id === id)
        if (!turn?.runId || (err instanceof ApiError && err.status >= 400 && err.status < 500)) break
        if (attempt < 2) await new Promise(resolve => window.setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
    if (error && !controller.signal.aborted) {
      update(id, t => ({ ...t, error: error instanceof ApiError ? error.message : copy.interrupted,
        status: t.runId ? t.status : 'FAILED', activity: undefined }))
    }
    if (active.current === controller) {
      active.current = null
      if (mounted.current) setBusy(false)
    }
  }, [copy.interrupted, event, update])

  useEffect(() => {
    mounted.current = true
    const config = new AbortController()
    void apiGet<{ available: boolean }>('/api/assistant/config').then(value => {
      if (!config.signal.aborted) setAvailable(value.available)
    }).catch(() => { if (!config.signal.aborted) setAvailable(undefined) })
    const last = current.current.turns.at(-1)
    if (last?.status === 'RUNNING' && last.runId) {
      void consume(last.id, `/api/assistant/runs/${last.runId}/events?after=${last.sequence}`, undefined, true)
    } else if (last?.status === 'RUNNING') update(last.id, t => ({ ...t, status: 'FAILED', error: copy.interrupted }))
    return () => { mounted.current = false; config.abort(); active.current?.abort() }
    // Restore exactly once on mount. Language/page changes apply to the next message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = useCallback((message: string) => {
    const text = message.trim()
    const last = current.current.turns.at(-1)
    if (!text || text.length > 4000 || active.current || last?.status === 'WAITING' || last?.status === 'RUNNING') return
    const history = conversationHistory(current.current.turns)
    const id = crypto.randomUUID()
    commit(s => ({ ...s, turns: [...s.turns.slice(-19), { id, question: text, sequence: 0, status: 'RUNNING', parts: [] }] }))
    void consume(id, '/api/assistant/chat', { message: text, lang, pagePath: location.pathname + location.search, history })
  }, [commit, consume, lang, location.pathname, location.search])
  const decide = useCallback((turnId: string, approvalId: string, choiceId: string) => {
    const turn = current.current.turns.find(t => t.id === turnId)
    if (!turn?.runId || turn.status !== 'WAITING' || active.current) return
    update(turnId, t => ({ ...t, status: 'RUNNING', error: undefined }))
    void consume(turnId, `/api/assistant/runs/${turn.runId}/resume`, { approvalId, choiceId }).then(() => {
      const result = current.current.turns.find(t => t.id === turnId)
      if (result?.status === 'RUNNING' && result.error && !result.approval?.resolved) {
        update(turnId, t => ({ ...t, status: 'WAITING' }))
      }
    })
  }, [consume, update])
  const recover = useCallback((id: string) => {
    const turn = current.current.turns.find(t => t.id === id)
    if (!turn?.runId || active.current) return
    update(id, t => ({ ...t, error: undefined }))
    void consume(id, `/api/assistant/runs/${turn.runId}/events?after=${turn.sequence}`, undefined, true)
  }, [consume, update])
  const cancelRun = useCallback(async (turn: AssistantTurn) => {
    if (!turn.runId) return
    await fetch(`/api/assistant/runs/${turn.runId}/cancel`, {
      method: 'POST', credentials: 'same-origin', headers: { 'X-R-Session': current.current.token },
    }).catch(() => undefined)
  }, [])
  const stop = useCallback(() => {
    const last = current.current.turns.at(-1)
    active.current?.abort(); active.current = null; setBusy(false)
    if (last) {
      update(last.id, t => ({ ...t, status: 'CANCELLED', activity: undefined, error: undefined }))
      void cancelRun(last)
    }
  }, [cancelRun, update])
  const clear = useCallback(() => {
    const last = current.current.turns.at(-1)
    active.current?.abort(); active.current = null; setBusy(false)
    if (last && ['RUNNING', 'WAITING'].includes(last.status)) void cancelRun(last)
    commit(s => ({ ...s, turns: [] }))
  }, [cancelRun, commit])
  return { turns: snapshot.turns, busy, available, send, decide, recover, stop, clear }
}
