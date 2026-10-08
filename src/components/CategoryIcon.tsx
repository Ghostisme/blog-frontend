import {
  AppstoreOutlined,
  ApartmentOutlined,
  CloudOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  LaptopOutlined,
  MobileOutlined,
  RobotOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

/**
 * 领域图标。后端只存图标名（category.icon），具体用哪个图形由前端决定，
 * 这样后台新增领域时填一个已知名称即可，不需要后端感知任何 UI 库。
 * 名称与 V2 迁移里的种子数据一致；不认识的名称回退到通用图标。
 */
const ICONS: Record<string, ReactNode> = {
  laptop: <LaptopOutlined />,
  server: <CloudServerOutlined />,
  database: <DatabaseOutlined />,
  cloud: <CloudOutlined />,
  mobile: <MobileOutlined />,
  apartment: <ApartmentOutlined />,
  solution: <SolutionOutlined />,
  robot: <RobotOutlined />,
  interview: <SolutionOutlined />,
  agent: <RobotOutlined />,
}

export function CategoryIcon({ name }: { name: string | null | undefined }) {
  return <>{(name && ICONS[name]) || <AppstoreOutlined />}</>
}
