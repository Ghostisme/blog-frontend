export type RunStatus = 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export interface ArticleLink { title: string; summary?: string | null; path: string; readingMinutes?: number; views?: number }
export interface TextPart { type: 'text'; id: string; text: string }
export interface ArticlesPart { type: 'articles'; id: string; title: string; items: ArticleLink[] }
export interface TablePart { type: 'table'; id: string; title: string; columns: string[]; rows: (string | number)[][] }
export interface ChartPart { type: 'chart'; id: string; title: string; kind: 'bar' | 'line'; unit?: string; source?: string; values: { label: string; value: number; path?: string }[] }
export interface DocumentPart { type: 'document'; id: string; title: string; content: string }
export interface NavigationPart { type: 'navigation'; id: string; path: string; label: string; executed: boolean }
export type RichPart = ArticlesPart | TablePart | ChartPart | DocumentPart
export type MessagePart = TextPart | RichPart | NavigationPart
export interface Approval { id: string; kind: 'question' | 'download'; title: string; description?: string; options: { id: string; label: string }[]; resolved?: string }
export interface AssistantTurn {
  id: string; question: string; runId?: string; sequence: number; status: RunStatus
  parts: MessagePart[]; activity?: string; approval?: Approval; error?: string
}
export interface AssistantEvent { id: number; type: string; data: Record<string, unknown> }
