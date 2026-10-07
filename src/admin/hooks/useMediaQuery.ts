import { useCallback, useSyncExternalStore } from 'react'

/**
 * 订阅 CSS 媒体查询的匹配结果。
 * 用 useSyncExternalStore 而不是 useState + useEffect：首次渲染就能拿到正确值，
 * 不会先按“宽屏”渲染一帧再跳成“窄屏”；窗口尺寸变化时也不会撕裂。
 */
export function useMediaQuery(query: string): boolean {
  // subscribe 必须保持引用稳定，否则每次渲染都会退订再重新订阅
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
