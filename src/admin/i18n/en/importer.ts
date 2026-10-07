import type { DeepString } from '../types'
import type { zhImporter } from '../zh/importer'

/** Markdown import page copy. */
export const enImporter: DeepString<typeof zhImporter> = {
  import: {
    title: 'Import articles',
    subtitle: 'Import Markdown files in bulk; all of them become drafts',
    notice:
      'Imported articles are always drafts. Topic and level are guessed from keywords and may be wrong. Review them under "Articles" in bulk, then publish together. Re-importing the same title is skipped automatically.',
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
    col: { file: 'File', status: 'Status', title: 'Title', message: 'Note' },
  },
}
