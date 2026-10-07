import type { Messages } from './zh-CN'

/**
 * English copy. Typed against the Chinese structure so a missing key fails the build.
 * Plural forms: i18next looks up `key_one` / `key_other` for English when `count` is passed,
 * so counted strings use `_one` / `_other` suffixes here (Chinese only needs the plain key).
 */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>
} & {
  // 每一层都允许额外的键：英文复数形式(views_one / views_other)在中文结构里不存在，
  // 不放开的话会被当成“多余属性”报错；必需键仍由上面的映射类型强制要求齐全
  [extra: string]: unknown
}

export const enUS: Widen<Messages> = {
  site: {
    tagline: 'Engineering notes and lessons learned',
  },
  nav: {
    home: 'Home',
    articles: 'Articles',
    resume: 'Resume',
    menu: 'Menu',
  },
  common: {
    loading: 'Loading…',
    retry: 'Retry',
    backHome: 'Back to home',
    loadFailed: 'Failed to load',
    empty: 'Nothing here yet',
    all: 'All',
    views: '{{count}} views',
    views_one: '{{count}} view',
    views_other: '{{count}} views',
    minutesRead: '{{count}} min read',
    viewAll: 'View all',
    clear: 'Clear',
    skip: 'Skip to main content',
  },
  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
  },
  lang: {
    switchTo: 'Change language',
    zh: '简体中文',
    en: 'English',
  },
  level: {
    BEGINNER: { name: 'Beginner', desc: 'Core concepts and quick starts' },
    INTERMEDIATE: { name: 'Intermediate', desc: 'Everyday problems and practices' },
    ADVANCED: { name: 'Advanced', desc: 'Internals and performance tuning' },
    EXPERT: { name: 'Expert', desc: 'Architecture and large-scale systems' },
  },
  home: {
    hello: "Hi, I'm",
    defaultIntro: 'Notes on frontend, backend, databases, DevOps and mobile engineering.',
    readArticles: 'Read articles',
    viewResume: 'View resume',
    statArticles: 'articles',
    statTopics: 'topics',
    statTags: 'tags',
    byLevel: 'Browse by level',
    byLevelSub: 'From beginner to expert — find what fits where you are',
    byTopic: 'Browse by topic',
    byTopicSub: 'The breadth of what an engineer touches day to day',
    latest: 'Latest articles',
    popular: 'Popular articles',
    articleCount: '{{count}} articles',
    articleCount_one: '{{count}} article',
    articleCount_other: '{{count}} articles',
    noArticlesYet: 'Articles are being prepared. Stay tuned.',
  },
  articles: {
    title: 'Articles',
    subtitle: 'Filter by level, topic and tag',
    searchPlaceholder: 'Search titles, summaries or content…',
    sortLatest: 'Latest',
    sortHot: 'Popular',
    level: 'Level',
    category: 'Topic',
    tag: 'Tags',
    moreTags: 'More tags',
    lessTags: 'Collapse',
    total: '{{count}} articles',
    total_one: '{{count}} article',
    total_other: '{{count}} articles',
    noResult: 'No articles match your filters',
    noResultHint: 'Try a different keyword or clear some filters.',
    clearFilters: 'Clear all filters',
  },
  article: {
    notFound: 'This article does not exist or is not published yet',
    publishedAt: 'Published',
    updatedAt: 'Updated',
    toc: 'Contents',
    tocEmpty: 'No table of contents',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    reprintTitle: 'Reposted from the web',
    reprintAuthor: 'Original author: {{author}}',
    reprintLink: 'Read the original',
    reprintNote: 'All rights belong to the original author. Kept here for personal study.',
    older: 'Older',
    newer: 'Newer',
    noMore: 'Nothing further',
    backToList: 'Back to articles',
  },
  resume: {
    title: 'Resume',
    print: 'Print / Save as PDF',
    langLabel: 'Resume language',
    summary: 'Summary',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    links: 'Links',
    techStack: 'Tech stack',
    empty: 'The resume has not been filled in yet',
  },
  notFound: {
    title: 'Page not found',
    subtitle: 'The page you are looking for may have been moved or deleted.',
  },
  footer: {
    rights: 'All rights reserved',
    builtWith: 'Built with React · Ant Design · Spring Boot',
  },
}
