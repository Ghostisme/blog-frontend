import { ApiError } from '../api/client'
import type { AssistantEvent } from './types'

/** Incremental SSE framing: UTF-8, split CRLF, multiline data and comment heartbeats. */
export class SseDecoder {
  private buffer = ''
  private lines: string[] = []
  push(chunk: string): AssistantEvent[] {
    this.buffer += chunk
    if (this.buffer.length > 150_000) throw new Error('Assistant stream frame is too large')
    const events: AssistantEvent[] = []
    let end: number
    while ((end = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, end).replace(/\r$/, '')
      this.buffer = this.buffer.slice(end + 1)
      if (line === '') {
        const event = this.frame()
        if (event) events.push(event)
        this.lines = []
      } else this.lines.push(line)
    }
    return events
  }
  private frame(): AssistantEvent | undefined {
    let id = 0
    let type = 'message'
    const data: string[] = []
    for (const line of this.lines) {
      if (line.startsWith(':')) continue
      const colon = line.indexOf(':')
      const key = colon < 0 ? line : line.slice(0, colon)
      const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '')
      if (key === 'id') id = Number(value)
      if (key === 'event') type = value
      if (key === 'data') data.push(value)
    }
    if (!data.length) return undefined
    const value: unknown = JSON.parse(data.join('\n'))
    if (!Number.isSafeInteger(id) || id < 1 || !value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Invalid assistant stream event')
    }
    return { id, type, data: value as Record<string, unknown> }
  }
}

export async function assistantStream(
  path: string, token: string, signal: AbortSignal, onEvent: (event: AssistantEvent) => void, body?: unknown,
): Promise<void> {
  const controller = new AbortController()
  const abort = () => controller.abort(signal.reason)
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) abort()
  let idle = window.setTimeout(() => controller.abort('idle'), 45_000)
  const touch = () => {
    window.clearTimeout(idle)
    idle = window.setTimeout(() => controller.abort('idle'), 45_000)
  }
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  try {
    const response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', signal: controller.signal,
      headers: { 'X-R-Session': token, Accept: 'text/event-stream', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { message?: string }
      throw new ApiError(response.status, error.message ?? `请求失败 (${response.status})`)
    }
    if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
      throw new Error('Assistant did not return an event stream')
    }
    reader = response.body.getReader()
    const utf8 = new TextDecoder()
    const sse = new SseDecoder()
    let completed = false
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      touch()
      for (const event of sse.push(utf8.decode(chunk.value, { stream: true }))) {
        onEvent(event)
        if (event.type === 'done') completed = true
      }
    }
    if (!completed) throw new Error('Assistant stream ended before completion')
  } finally {
    window.clearTimeout(idle)
    signal.removeEventListener('abort', abort)
    await reader?.cancel().catch(() => undefined)
  }
}
