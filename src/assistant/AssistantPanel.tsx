import { ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, BookOutlined, CloseOutlined, CopyOutlined, ExpandOutlined, FileTextOutlined, PlusOutlined, ShrinkOutlined, StopOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { App, Button, Input, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { AssistantMarkdown, DocumentPreview, MessageContent } from './AssistantContent'
import { en, zh } from './copy'
import type { DocumentPart } from './types'
import { useAssistant } from './useAssistant'
import styles from './assistant.module.css'

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation()
  const copy = i18n.language.startsWith('zh') ? zh : en
  const lang = i18n.language.startsWith('zh') ? 'zh' : 'en'
  const assistant = useAssistant(lang, copy)
  const { message } = App.useApp()
  const location = useLocation()
  const [wide, setWide] = useState(false)
  const [tab, setTab] = useState<'chat' | 'documents'>('chat')
  const [draft, setDraft] = useState('')
  const [preview, setPreview] = useState<DocumentPart | null>(null)
  const [atBottom, setAtBottom] = useState(true)
  const bottom = useRef(true)
  const scroll = useRef<HTMLDivElement>(null)
  const input = useRef<React.ComponentRef<typeof Input.TextArea>>(null)
  const panel = useRef<HTMLElement>(null)
  const last = assistant.turns.at(-1)
  const waiting = last?.status === 'WAITING'
  const running = last?.status === 'RUNNING'
  const documents = assistant.turns.flatMap(turn => turn.parts.filter((p): p is DocumentPart => p.type === 'document'))
  const pageName = location.pathname === '/' ? copy.home : location.pathname === '/articles' ? copy.articleList : location.pathname.startsWith('/articles/') ? copy.article : copy.resume

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 100)
      return () => window.clearTimeout(timer)
    }
  }, [open])
  useEffect(() => {
    if (bottom.current && scroll.current && tab === 'chat') {
      const frame = requestAnimationFrame(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight })
      return () => cancelAnimationFrame(frame)
    }
  }, [assistant.turns, tab, open])
  useEffect(() => {
    if (!open) return
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && !preview) onClose() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open, onClose, preview])

  const send = (text = draft) => {
    if (!text.trim() || running || waiting || assistant.busy || assistant.available === false) return
    if (text.length > 4000) { void message.info(copy.tooLong); return }
    bottom.current = true; setAtBottom(true); setDraft(''); setTab('chat')
    assistant.send(text)
  }
  const copyReply = async (text: string) => {
    try { await navigator.clipboard.writeText(text); void message.success(copy.copied) }
    catch { void message.error(copy.copyFailed) }
  }
  if (!open) return <DocumentPreview document={preview} copy={copy} onClose={() => setPreview(null)} />
  return (
    <>
      <section ref={panel} className={`${styles.panel} ${wide ? styles.wide : ''}`} role="dialog" aria-modal="false" aria-label={copy.name}>
        <header className={styles.header}>
          <span className={styles.avatar}>R<span className={styles.avatarSpark}>✦</span></span>
          <div className={styles.identity}><strong>{copy.name}</strong><span>{copy.subtitle}</span></div>
          <div className={styles.headerActions}>
            <Tooltip title={copy.newChat}><Button type="text" size="small" aria-label={copy.newChat} icon={<PlusOutlined />} onClick={() => { assistant.clear(); setTab('chat'); setDraft('') }} /></Tooltip>
            <Tooltip title={wide ? copy.collapse : copy.expand}><Button type="text" size="small" aria-label={wide ? copy.collapse : copy.expand} icon={wide ? <ShrinkOutlined /> : <ExpandOutlined />} onClick={() => setWide(v => !v)} /></Tooltip>
            <Button type="text" size="small" aria-label={copy.close} icon={<CloseOutlined />} onClick={onClose} />
          </div>
        </header>
        <div className={styles.tabs}>
          <button type="button" data-active={tab === 'chat'} onClick={() => setTab('chat')}>{copy.chat}</button>
          <button type="button" data-active={tab === 'documents'} onClick={() => setTab('documents')}>{copy.documents}{documents.length > 0 && <span>{documents.length}</span>}</button>
          <span className={styles.connection}><i data-connected={assistant.available === true} />{assistant.available === true ? copy.online : assistant.available === false ? copy.offline : copy.connecting}</span>
        </div>
        <div className={styles.body} ref={scroll} onScroll={() => {
          const root = scroll.current
          const near = !root || root.scrollHeight - root.scrollTop - root.clientHeight < 80
          bottom.current = near; setAtBottom(near)
        }}>
          {tab === 'documents' ? (
            <div className={styles.documentList}>{documents.length === 0 ? <div className={styles.documentEmpty}><FileTextOutlined /><p>{copy.documentEmpty}</p></div> : documents.map(doc => <MessageContent part={doc} copy={copy} onPreview={setPreview} key={doc.id} />)}</div>
          ) : assistant.turns.length === 0 ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeMark}><span>R</span><ThunderboltOutlined /></div>
              <span className={styles.eyebrow}>A LITTLE HELP. A NEW PERSPECTIVE.</span>
              <h2>{copy.hello}</h2><p>{copy.intro}</p>
              <div className={styles.suggestions}>{[BookOutlined, FileTextOutlined, BarChartOutlined, ThunderboltOutlined].map((Icon, i) => <button type="button" key={i} disabled={assistant.available === false} onClick={() => send(copy.suggestions[i])}><span className={styles.suggestionIcon} data-index={i}><Icon /></span><strong>{copy.suggestionLabels[i]}</strong><small>{copy.suggestionSubtitles[i]}</small><ArrowUpOutlined /></button>)}</div>
              {assistant.available === false && <p className={styles.unavailable}>{copy.unavailable}</p>}
            </div>
          ) : (
            <div className={styles.messages}>{assistant.turns.map(turn => <div key={turn.id} className={styles.turn}>
              <div className={styles.userMessage}><AssistantMarkdown text={turn.question} /></div>
              <div className={styles.replyLabel}><span className={styles.smallAvatar}>R</span><strong>{copy.name}</strong></div>
              <div className={styles.reply} aria-busy={turn.status === 'RUNNING'}>
                {turn.parts.map(part => <MessageContent key={part.id} part={part} copy={copy} onPreview={setPreview} />)}
                {turn.status === 'RUNNING' && !turn.error && <div className={styles.activity} role="status"><span className={styles.dots}><i /><i /><i /></span>{turn.activity ?? copy.pending}</div>}
                {turn.approval && <section className={styles.approval} aria-label={turn.approval.title}>
                  <div className={styles.approvalLabel}><span>✦</span>{turn.approval.resolved ? copy.decided : copy.waiting}</div>
                  <strong>{turn.approval.title}</strong>{turn.approval.description && <p>{turn.approval.description}</p>}
                  {turn.approval.resolved ? <span className={styles.decision}>{turn.approval.resolved}</span> : <div className={styles.approvalChoices}>{turn.approval.options.map((choice, index) => <Button key={choice.id} type={index === 0 ? 'primary' : 'default'} disabled={assistant.busy || turn.status !== 'WAITING'} onClick={() => assistant.decide(turn.id, turn.approval!.id, choice.id)}>{choice.label}</Button>)}</div>}
                </section>}
                {turn.error && <div className={styles.error} role="alert"><p>{turn.error}</p>{turn.runId && turn.status === 'RUNNING' ? <Button size="small" disabled={assistant.busy} onClick={() => assistant.recover(turn.id)}>{copy.recover}</Button> : <Button size="small" disabled={assistant.busy || waiting || running} onClick={() => send(turn.question)}>{copy.retry}</Button>}</div>}
                {turn.status === 'CANCELLED' && <span className={styles.stopped}>{copy.stopped}</span>}
                {turn.status === 'COMPLETED' && turn.parts.some(p => p.type === 'text') && <button type="button" className={styles.copyReply} aria-label={copy.copy} title={copy.copy} onClick={() => void copyReply(turn.parts.filter(p => p.type === 'text').map(p => p.text).join('\n'))}><CopyOutlined /> {copy.copy}</button>}
              </div>
            </div>)}</div>
          )}
        </div>
        {!atBottom && tab === 'chat' && <button type="button" className={styles.jumpLatest} onClick={() => { scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' }); bottom.current = true; setAtBottom(true) }}><ArrowDownOutlined /> {copy.more}</button>}
        <div className={styles.composerArea}>
          <div className={styles.context}><span className={styles.contextDot} />{copy.context}<strong>{pageName}</strong><span>{waiting ? copy.waiting : assistant.busy ? copy.pending : copy.ready}</span></div>
          <div className={styles.composer} data-disabled={waiting || assistant.available === false}>
            <Input.TextArea ref={input} value={draft} onChange={e => setDraft(e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} variant="borderless" aria-label={copy.send}
              placeholder={waiting ? copy.chooseFirst : copy.placeholder} disabled={waiting || assistant.available === false} maxLength={4000}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }} />
            {running || assistant.busy ? <button type="button" className={styles.send} onClick={assistant.stop} aria-label={copy.stop} title={copy.stop}><StopOutlined /></button> : <button type="button" className={styles.send} onClick={() => send()} disabled={!draft.trim() || waiting || assistant.available === false} aria-label={copy.send}><ArrowUpOutlined /></button>}
          </div>
          <div className={styles.composerHint}><span>{copy.hint}</span><span>✦ {copy.name}</span></div>
        </div>
      </section>
      <DocumentPreview document={preview} copy={copy} onClose={() => setPreview(null)} />
    </>
  )
}
