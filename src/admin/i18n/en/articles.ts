import type { DeepString } from '../types'
import type { zhArticles } from '../zh/articles'

/**
 * Article management copy. Count messages are worded to read correctly for any count
 * (no plural suffixes), which keeps zh/en keys identical.
 */
export const enArticles: DeepString<typeof zhArticles> = {
  articles: {
    title: 'Articles',
    subtitle: 'Fix topics and levels of imported drafts in bulk here, then publish them together',
    create: 'New article',
    total: 'Total: {{count}}',
    deleted: 'Article deleted',
    deleteConfirm: 'Delete this article?',
    viewOnSite: 'View on site',
    uncategorized: 'No topic',
    filterStatus: 'Status',
    filterLevel: 'Level',
    filterCategory: 'Topic',
    searchLabel: 'Search articles',
    searchPlaceholder: 'Search title, summary or content',
    sortLabel: 'Sort',
    clearFilters: 'Clear filters',
    translation: {
      backfill: 'Backfill English',
      result: 'Scanned {{scanned}}, queued {{queued}}, already complete {{alreadyTranslated}}, locked {{locked}}',
    },
    sort: { UPDATED: 'Recently edited', LATEST: 'Recently published', HOT: 'Most viewed' },
    col: {
      title: 'Title',
      status: 'Status',
      level: 'Level',
      category: 'Topic',
      tags: 'Tags',
      views: 'Views',
      updatedAt: 'Updated',
      actions: 'Actions',
    },
    batch: {
      label: 'Bulk actions',
      selected: 'Selected: {{count}}',
      publish: 'Publish',
      unpublish: 'Move to drafts',
      setLevel: 'Set level',
      setCategory: 'Set topic',
      clear: 'Clear selection',
      updated: 'Updated: {{count}}',
      deleted: 'Deleted: {{count}}',
      deleteTitle: 'Delete the selected articles ({{count}})?',
      deleteContent: 'This cannot be undone.',
      publishHint: 'Every article needs a topic before it can be published. Use "Set topic" first, then publish.',
    },
  },
}
