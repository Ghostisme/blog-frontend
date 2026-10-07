import { useEffect, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TableOfContents.module.css'

export interface TocHeading {
  id: string
  text: string
  /** 2 或 3，对应 h2 / h3 */
  level: 2 | 3
}

/** 标题位于视口顶部这条“观察线”附近时视为当前章节：上边界留出吸顶页头，下边界缩到视口上 1/3。 */
const OBSERVER_MARGIN = '-80px 0px -66% 0px'

/**
 * 文章目录：点击跳转，并随滚动高亮当前所在章节。
 *
 * 用 IntersectionObserver 而不是监听 scroll 事件再逐个量位置：
 * 浏览器只在标题进出观察线时才通知，长文章滚动时不会有持续的布局计算开销。
 */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<string | undefined>()

  useEffect(() => {
    if (headings.length === 0) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        // 同一批通知里可能有多个标题，取排在最前面的那个正在相交的作为当前章节
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0].target.id)
        }
      },
      { rootMargin: OBSERVER_MARGIN },
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  /**
   * 接管目录点击，不走浏览器原生的锚点跳转。
   *
   * 原生跳转会新增一条【没有路由 key】的历史记录，React Router 的 ScrollRestoration
   * 会把这些记录都当作同一个 "default" 位置来保存/恢复滚动，结果第一次点击落点不对，
   * 之后的点击干脆被还原回原位（滚不动）。
   * 这里改为：手动滚动 + 用 replaceState【带着原有 state】更新 hash。
   * replaceState 不会触发 popstate，路由完全不知情，也就不会出手干预；
   * 同时 URL 仍带上 #章节，可以复制分享。scrollIntoView 会遵守 html 上的 scroll-padding-top，不会被吸顶页头遮住。
   */
  const jumpTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView()
    history.replaceState(history.state, '', `#${id}`)
  }

  return (
    <nav className={styles.toc} aria-label={t('article.toc')}>
      <p className={styles.title}>{t('article.toc')}</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? styles.sub : undefined}>
            <a href={`#${h.id}`} onClick={(e) => jumpTo(e, h.id)} className={h.id === activeId ? styles.active : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
