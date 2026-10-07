import type { DeepString } from '../types'
import type { zhImporter } from '../zh/importer'

/** Markdown import page copy. */
export const enImporter: DeepString<typeof zhImporter> = {
  import: {
    title: 'Import articles',
    subtitle: 'Paste public article URLs or upload Markdown files; all of them become drafts',
    notice:
      'Imported articles are always drafts. Topic and level are guessed from keywords and may be wrong. Review them under "Articles" in bulk, then publish together. Re-importing the same title is skipped automatically. Login walls, paywalls, or client-rendered pages with no body will fail.',
    filesTitle: 'Upload Markdown files',
    urlsTitle: 'Paste article URLs',
    urlsHint:
      'One http(s) URL per line, commas also work. Up to {{max}} per request. Juejin uses the public API; other sites are fetched as public HTML.',
    urlsPlaceholder: 'https://juejin.cn/post/…',
    urlsStart: 'Import URLs ({{count}})',
    urlsEmpty: 'Paste at least one http(s) URL first',
    urlsSkipped: 'Ignored {{count}} invalid URL(s) (must be http/https and within the length limit)',
    urlsTooMany: 'At most {{max}} URLs per request; kept the first {{max}}',
    dropTitle: 'Click or drag Markdown files here',
    dropHint: '.md / .markdown, multiple files allowed; up to {{max}} per upload, each under {{size}}',
    rejectedType: 'Ignored {{count}} non-Markdown file(s)',
    rejectedSize: 'Ignored {{count}} file(s) larger than {{size}}',
    rejectedCount: 'At most {{max}} files per upload; the extra ones were ignored',
    tooBig: 'Total size exceeds {{size}}. Import in smaller batches',
    start: 'Start import ({{count}} files)',
    clear: 'Clear list',
    totalSize: 'Total {{size}}',
    uploading: 'Importing. This can take a while for many files, please keep this page open…',
    failed: 'Import request failed. Your file list is kept, so you can retry',
    resultTitle: 'Import result',
    successTitle: 'Imported {{count}} article(s)',
    successHint: 'They are all drafts now. Fix their topics and levels under Articles, then publish.',
    goCorrect: 'Review drafts in Articles',
    total: 'Files',
    status: { IMPORTED: 'Imported', SKIPPED: 'Skipped', FAILED: 'Failed' },
    col: { file: 'Source', status: 'Status', title: 'Title', message: 'Note' },
  },
}
