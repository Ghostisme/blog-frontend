import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * “未保存的修改”守卫：标记脏状态，并在站内跳转和关闭/刷新标签页时拦截。
 *
 * 脏标记同时存 ref 和 state：
 * - state 用来驱动 beforeunload 的注册和界面提示；
 * - ref 给 useBlocker 读。保存成功后紧接着 navigate 时，setState 还没来得及重渲染，
 *   blocker 若读 state 会看到旧的“脏”值而把这次正常跳转拦下来；ref 是同步更新的，不存在这个时间差。
 *
 * 返回的 blocker 交给 <LeaveConfirm> 渲染确认框。
 */
export function useUnsavedGuard() {
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(false)

  const markDirty = useCallback(() => {
    // 表单每次按键都会调用：已经是脏的就什么都不做，避免每个字符都触发重渲染
    if (!dirtyRef.current) {
      dirtyRef.current = true
      setDirty(true)
    }
  }, [])

  const markClean = useCallback(() => {
    dirtyRef.current = false
    setDirty(false)
  }, [])

  // 只在路径变化时拦截；同一页面内改 query/hash 不算“离开”
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) {
      return
    }
    // 现代浏览器忽略自定义文案，只要 preventDefault 就会弹出通用的离开确认
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return { dirty, markDirty, markClean, blocker }
}
