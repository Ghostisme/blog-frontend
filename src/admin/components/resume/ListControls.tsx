import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'

interface ListControlsProps {
  index: number
  count: number
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
}

/** 动态列表每一行的“上移 / 下移 / 删除”。首行不能再上移、末行不能再下移。图标按钮都带 aria-label。 */
export function ListControls({ index, count, onMove, onRemove }: ListControlsProps) {
  const { t } = useTranslation('admin')
  return (
    <Space size={0}>
      <Button
        type="text"
        size="small"
        icon={<ArrowUpOutlined />}
        disabled={index === 0}
        aria-label={t('resume.moveUp')}
        onClick={() => onMove(index, index - 1)}
      />
      <Button
        type="text"
        size="small"
        icon={<ArrowDownOutlined />}
        disabled={index === count - 1}
        aria-label={t('resume.moveDown')}
        onClick={() => onMove(index, index + 1)}
      />
      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        aria-label={t('common.delete')}
        onClick={() => onRemove(index)}
      />
    </Space>
  )
}
