/** 单次最多文件数：与后端 ImportService.MAX_FILES 一致，超出后端会整批拒绝。 */
export const MAX_IMPORT_FILES = 200

/**
 * 单文件大小上限：后端 multipart.max-file-size 为 5MB。
 * 超出时后端返回 413 并让整批失败，所以必须在前端提前拦下来，不能等后端。
 */
export const MAX_FILE_BYTES = 5 * 1024 * 1024

/** 整个请求大小上限：后端 multipart.max-request-size 为 60MB。 */
export const MAX_TOTAL_BYTES = 60 * 1024 * 1024

/** 单次最多链接数：与后端 ImportService.MAX_URLS 一致。 */
export const MAX_IMPORT_URLS = 10

/** 与后端 @Size(max = 2048) 对齐。 */
export const MAX_URL_LENGTH = 2048

export type FileRejectReason = 'type' | 'size'

/** 后端按扩展名（忽略大小写）判定 .md / .markdown，这里保持同一规则。 */
export function isMarkdownName(name: string): boolean {
  return /\.(md|markdown)$/i.test(name)
}

/**
 * 判断文件是否允许加入上传列表；通过返回 null，否则返回原因。
 * 空文件不在此拦截：让后端逐文件返回“文件为空”，管理员能在结果表里看到具体是哪一个。
 */
export function rejectReason(file: { name: string; size: number }): FileRejectReason | null {
  if (!isMarkdownName(file.name)) {
    return 'type'
  }
  return file.size > MAX_FILE_BYTES ? 'size' : null
}

/** 字节数 → 人类可读。 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 从文本框抽出 http(s) 链接。按行切，也接受逗号/空白分隔。
 * 去重保序；非法行、过长行丢掉，由调用方提示。
 */
export function parseImportUrls(raw: string): { urls: string[]; skipped: number } {
  const seen = new Set<string>()
  const urls: string[] = []
  let skipped = 0
  for (const part of raw.split(/[\s,，;；]+/)) {
    const url = part.trim()
    if (!url) continue
    if (!/^https?:\/\/\S+$/i.test(url) || url.length > MAX_URL_LENGTH) {
      skipped += 1
      continue
    }
    if (seen.has(url)) continue
    seen.add(url)
    urls.push(url)
  }
  return { urls, skipped }
}
