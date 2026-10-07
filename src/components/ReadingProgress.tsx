import { useEffect, useRef, type RefObject } from 'react'
import styles from './ReadingProgress.module.css'

/**
 * 顶部阅读进度条：按【文章正文】的滚动位置计算，而不是整个页面——
 * 整页高度里包含页脚和上下篇导航，用它算会让读完正文时进度还停在 90%。
 *
 * 直接改 DOM 的 transform 而不走 React state：滚动时每帧都要更新，
 * 走 state 会让整个文章页每帧重渲染一次。
 */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = target.current
      if (!el || !bar.current) {
        return
      }
      const rect = el.getBoundingClientRect()
      // 可滚动距离 = 正文高度 - 一屏；正文不足一屏时视为已读完
      const scrollable = rect.height - window.innerHeight
      const progress = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / scrollable))
      bar.current.style.transform = `scaleX(${progress})`
    }
    // requestAnimationFrame 节流：一帧内多次 scroll 事件只计算一次
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [target])

  return <div ref={bar} className={styles.bar} role="presentation" />
}
