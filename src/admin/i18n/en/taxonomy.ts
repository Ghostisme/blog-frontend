import type { DeepString } from '../types'
import type { zhTaxonomy } from '../zh/taxonomy'

/** Topic (category) and tag management copy. */
export const enTaxonomy: DeepString<typeof zhTaxonomy> = {
  categories: {
    title: 'Topics',
    subtitle: 'Articles are grouped by topic; the public site filters on it',
    create: 'New topic',
    createTitle: 'New topic',
    editTitle: 'Edit topic',
    builtin: 'Built-in',
    builtinTip: 'Automatic classification on import depends on this code',
    builtinNotice:
      'The five codes frontend / backend / database / devops / mobile are used by the automatic classification of "Import". Changing or deleting them raises no error, but articles imported afterwards will no longer be sorted into them automatically.',
    builtinWarning:
      'This is a built-in topic. Changing its code disables automatic classification into it on import; renaming or re-ordering is safe.',
    builtinDeleteTitle: 'Delete the built-in topic "{{name}}"?',
    builtinDeleteContent:
      'After deletion, imported articles can no longer be sorted into this topic automatically (it can only be deleted once no article uses it). Continue?',
    code: 'Code',
    codeHelp: 'An identifier: lowercase letters, digits and hyphens only, unique across the site',
    codeRequired: 'Please enter a code',
    codeInvalid: 'Use lowercase letters, digits and hyphens only',
    codeTooLong: 'Code can be at most 32 characters',
    codeDuplicate: 'This code is already in use',
    nameZh: 'Chinese name',
    nameEn: 'English name',
    nameRequired: 'Please enter a name',
    nameTooLong: 'Name can be at most 64 characters',
    icon: 'Icon key',
    iconHelp: 'Optional. The public site uses it to pick an icon, e.g. laptop, server',
    iconTooLong: 'Icon key can be at most 32 characters',
    sortOrder: 'Sort order',
    sortOrderHelp: 'Smaller comes first',
    deleted: 'Topic deleted',
    deleteConfirm: 'Delete the topic "{{name}}"?',
    inUse: 'This topic still has {{count}} article(s). Move or delete them first',
    col: {
      sortOrder: 'Order',
      code: 'Code',
      nameZh: 'Chinese name',
      nameEn: 'English name',
      icon: 'Icon',
      articleCount: 'Articles',
      actions: 'Actions',
    },
  },
  tags: {
    title: 'Tags',
    subtitle: 'Rename tags for display, or clean up tags that are no longer used',
    autoCreateNotice:
      'There is no "new tag" button: type a new tag while editing an article and it is created when you save. Here you can only rename or delete tags.',
    searchLabel: 'Search tags',
    searchPlaceholder: 'Search Chinese name, English name or slug',
    onlyUnused: 'Unused tags only',
    editTitle: 'Edit tag',
    slug: 'Slug',
    slugHelp: 'The slug is used for de-duplication and cannot be changed',
    nameZh: 'Chinese name',
    nameEn: 'English name',
    nameRequired: 'Please enter a name',
    nameTooLong: 'Name can be at most 64 characters',
    renameWarning:
      'Note: tags are matched by their Chinese name when an article is saved. After renaming it, saving an article that has this tag creates a new tag with the new name, and the original tag is detached from that article. Changing only the English name is safe.',
    deleted: 'Tag deleted',
    deleteConfirm: 'Delete the tag "{{name}}"?',
    deleteHint: 'It is only removed from {{count}} article(s); the articles themselves are kept.',
    col: { nameZh: 'Chinese name', nameEn: 'English name', slug: 'Slug', articleCount: 'Articles', actions: 'Actions' },
  },
}
