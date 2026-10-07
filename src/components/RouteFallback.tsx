import { Spin } from 'antd'

/** 路由分块加载期间的占位。只在首次进入某个懒加载分支时出现一瞬间。 */
export function RouteFallback() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  )
}
