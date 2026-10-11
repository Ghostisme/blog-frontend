import { ArrowRightOutlined, CheckOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { Button, Modal, Skeleton } from 'antd'
import { lazy, memo, Suspense, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AssistantCopy } from './copy'
import { downloadText, publicAssistantPath, tableCsv } from './navigation'
import type { ChartPart, DocumentPart, MessagePart } from './types'
import styles from './assistant.module.css'

const Markdown = lazy(() => import('../components/Markdown'))
export function AssistantMarkdown({ text }: { text: string }) {
  return <Suspense fallback={<Skeleton active paragraph={{ rows: 2 }} />}><Markdown content={text} /></Suspense>
}

function Chart({ part }: { part: ChartPart }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number | null>(null)
  const gradient = useId()
  const max = Math.max(1, ...part.values.map(v => v.value))
  const total = part.values.reduce((sum, v) => sum + v.value, 0)
  const open = (path?: string) => { const safe = path && publicAssistantPath(path); if (safe) void navigate(safe) }
  const points = part.values.map((v, i) => ({
    x: 24 + i * 488 / Math.max(1, part.values.length - 1), y: 156 - v.value / max * 128,
  }))
  return (
    <section className={styles.richCard} aria-label={part.title}>
      <div className={styles.cardHead}><strong>{part.title}</strong><span className={styles.cardTag}>{part.unit}</span></div>
      {part.kind === 'line' ? (
        <>
          <svg viewBox="0 0 536 180" className={styles.lineChart} role="img" aria-label={part.title}>
            <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--color-primary)" stopOpacity="0.22" /><stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" /></linearGradient></defs>
            {[0, 1, 2, 3].map(i => <line key={i} x1="24" x2="512" y1={28 + i * 43} y2={28 + i * 43} stroke="var(--border)" strokeDasharray="4 4" />)}
            {points.length > 1 && <polygon points={`24,156 ${points.map(p => `${p.x},${p.y}`).join(' ')} 512,156`} fill={`url(#${gradient})`} />}
            <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinejoin="round" />
            {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={selected === i ? 6 : 4} fill="var(--color-primary)" stroke="var(--bg-elevated)" strokeWidth="2" onMouseEnter={() => setSelected(i)}><title>{part.values[i].label}: {part.values[i].value} {part.unit}</title></circle>)}
          </svg>
          <div className={styles.chartLegend}>{part.values.map((v, i) => <button key={i} type="button" onMouseEnter={() => setSelected(i)} onFocus={() => setSelected(i)} onClick={() => open(v.path)} data-selected={selected === i}>{v.label}<strong>{v.value}{part.unit && ` ${part.unit}`}</strong></button>)}</div>
        </>
      ) : (
        <div className={styles.bars}>{part.values.map((v, i) => (
          <button key={i} type="button" className={styles.barRow} onClick={() => open(v.path)} title={`${v.label}: ${v.value} ${part.unit ?? ''}${total > 0 ? ` · ${(v.value / total * 100).toFixed(1)}%` : ''}`} data-linked={Boolean(v.path)}>
            <span className={styles.barLabel}>{v.label}</span><span className={styles.barTrack}><span className={styles.barFill} style={{ width: `${v.value / max * 100}%`, animationDelay: `${i * 35}ms` }} /></span><strong>{v.value}</strong>
          </button>
        ))}</div>
      )}
      {part.source && <div className={styles.cardSource}>{part.source}</div>}
    </section>
  )
}

export function DocumentPreview({ document, copy, onClose }: { document: DocumentPart | null; copy: AssistantCopy; onClose: () => void }) {
  const firstLine = document?.content.split('\n', 1)[0].replace(/\r$/, '')
  const content = document && firstLine && /^#\s+/.test(firstLine) && firstLine.replace(/^#\s+/, '').trim() === document.title.trim()
    ? document.content.slice(firstLine.length).trimStart() : document?.content
  return (
    <Modal open={document !== null} onCancel={onClose} width={880} title={<span className={styles.previewHeading}><FileTextOutlined />{copy.previewTitle}</span>}
      footer={document ? <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadText(document.title, document.content)}>{copy.download}</Button> : null} destroyOnHidden>
      {document && <article className={styles.documentPreview}><div className={styles.documentTitle}><span>{copy.generated}</span><h1>{document.title}</h1></div><AssistantMarkdown text={content ?? ''} /></article>}
    </Modal>
  )
}

function MessageContentImpl({ part, copy, onPreview }: { part: MessagePart; copy: AssistantCopy; onPreview: (document: DocumentPart) => void }) {
  const navigate = useNavigate()
  const open = (path: string) => { const safe = publicAssistantPath(path); if (safe) void navigate(safe) }
  switch (part.type) {
    case 'text': return <div className={styles.markdown}><AssistantMarkdown text={part.text} /></div>
    case 'articles': return <section className={styles.articleResults} aria-label={part.title}>
      <div className={styles.resultLabel}>{part.title}</div>
      {part.items.length === 0 && <p className={styles.emptyResult}>{copy.noArticles}</p>}
      {part.items.map((a, i) => <button type="button" className={styles.articleLink} key={a.path + i} onClick={() => open(a.path)}>
        <span className={styles.articleIndex}>{String(i + 1).padStart(2, '0')}</span><span className={styles.articleInfo}><strong>{a.title}</strong>{a.summary && <span>{a.summary}</span>}{a.readingMinutes && <small>{a.readingMinutes} {copy.minutes}</small>}</span><ArrowRightOutlined />
      </button>)}
    </section>
    case 'chart': return <Chart part={part} />
    case 'table': return <section className={styles.richCard}>
      <div className={styles.cardHead}><strong>{part.title}</strong><button className={styles.textButton} type="button" onClick={() => downloadText(part.title, tableCsv(part.columns, part.rows), 'csv', 'text/csv;charset=utf-8')}><DownloadOutlined /> {copy.csv}</button></div>
      <div className={styles.tableWrap}><table><thead><tr>{part.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead><tbody>{part.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
    </section>
    case 'document': return <button type="button" className={styles.documentCard} onClick={() => onPreview(part)}>
      <span className={styles.documentIcon}><FileTextOutlined /></span><span><small>MARKDOWN</small><strong>{part.title}</strong><span>{part.content.length.toLocaleString()} {copy.words} · {copy.preview}</span></span><ArrowRightOutlined />
    </button>
    case 'navigation': return <button type="button" className={styles.navigationCard} onClick={() => open(part.path)}><CheckOutlined /><span>{part.executed ? copy.actionOpened : copy.actionLink} <strong>{part.label}</strong></span><ArrowRightOutlined /></button>
  }
}
export const MessageContent = memo(MessageContentImpl)
