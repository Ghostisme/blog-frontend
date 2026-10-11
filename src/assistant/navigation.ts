/** Recheck server actions at the browser boundary. No admin, external URLs or encoded path escapes. */
export function publicAssistantPath(value: string): string | undefined {
  try {
    if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.length > 512) return undefined
    const url = new URL(value, 'https://blog.example')
    const path = decodeURIComponent(url.pathname)
    if (url.origin !== 'https://blog.example' || url.hash || path.split('/').includes('..')) return undefined
    if (!['/', '/articles', '/resume'].includes(path) && !/^\/articles\/[\p{L}\p{N}_-]+$/u.test(path)) return undefined
    const keys = path === '/articles' ? ['page', 'level', 'category', 'tag', 'keyword', 'sort'] : ['lang']
    if (path.startsWith('/articles/') && url.search) return undefined
    if (Array.from(url.searchParams.keys()).some(key => !keys.includes(key))) return undefined
    return url.pathname + url.search
  } catch { return undefined }
}

export function downloadText(title: string, content: string, extension = 'md', mime = 'text/markdown;charset=utf-8'): void {
  const cleaned = Array.from(title).map(c => c.charCodeAt(0) < 32 ? '-' : c).join('').replace(/[<>:"/\\|?*]/g, '-')
  const filename = (cleaned.slice(0, 100) || 'Little-R') + '.' + extension
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function tableCsv(columns: string[], rows: (string | number)[][]): string {
  const cell = (value: string | number) => {
    const text = String(value)
    const escaped = /^[\s]*[=+\-@]/.test(text) ? "'" + text : text
    return '"' + escaped.replaceAll('"', '""') + '"'
  }
  return '\uFEFF' + [columns, ...rows].map(row => row.map(cell).join(',')).join('\r\n')
}
