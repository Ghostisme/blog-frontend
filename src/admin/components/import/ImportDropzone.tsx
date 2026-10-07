import { InboxOutlined } from '@ant-design/icons'
import { App, Upload, type UploadFile } from 'antd'
import { useTranslation } from 'react-i18next'
import { MAX_FILE_BYTES, MAX_IMPORT_FILES, formatBytes, rejectReason } from '../../utils/importFiles'

interface ImportDropzoneProps {
  fileList: UploadFile[]
  onChange: (fileList: UploadFile[]) => void
  disabled?: boolean
}

/**
 * Markdown 文件拖拽/选择区。文件只加入列表，不会自动上传——由页面上的“开始导入”按钮统一提交。
 *
 * beforeUpload 对每个文件各调用一次，但第二个参数是本批所有文件：
 * 汇总提示只在批内第一个文件时弹一次，否则一次拖入 50 个非 md 文件会弹 50 条提示。
 */
export function ImportDropzone({ fileList, onChange, disabled }: ImportDropzoneProps) {
  const { t } = useTranslation('admin')
  const { message } = App.useApp()

  const beforeUpload = (file: File, batch: File[]) => {
    const reason = rejectReason(file)
    const accepted = batch.filter((f) => !rejectReason(f))
    // 超出数量上限的部分：按批内顺序取前面的，排在后面的丢弃
    const overflow = fileList.length + accepted.indexOf(file) >= MAX_IMPORT_FILES

    if (batch.indexOf(file) === 0) {
      const wrongType = batch.filter((f) => rejectReason(f) === 'type').length
      const tooLarge = batch.filter((f) => rejectReason(f) === 'size').length
      if (wrongType) void message.warning(t('import.rejectedType', { count: wrongType }))
      if (tooLarge) void message.warning(t('import.rejectedSize', { count: tooLarge, size: formatBytes(MAX_FILE_BYTES) }))
      if (fileList.length + accepted.length > MAX_IMPORT_FILES) {
        void message.warning(t('import.rejectedCount', { max: MAX_IMPORT_FILES }))
      }
    }
    // false：加入列表但不自动上传；LIST_IGNORE：根本不进列表
    return reason || overflow ? Upload.LIST_IGNORE : false
  }

  return (
    <Upload.Dragger
      multiple
      // filter: 'native'：默认情况下拖入的非 md 文件会被组件悄悄丢掉，用户看不到任何反馈。
      // 改为交给 beforeUpload 统一判断，才能给出“已忽略 N 个非 Markdown 文件”的提示。
      // 点击选择时 format 仍会限制系统文件选择框只显示 md 文件
      accept={{ format: '.md,.markdown', filter: 'native' }}
      fileList={fileList}
      disabled={disabled}
      beforeUpload={beforeUpload}
      onChange={({ fileList: next }) => onChange(next)}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{t('import.dropTitle')}</p>
      <p className="ant-upload-hint">{t('import.dropHint', { max: MAX_IMPORT_FILES, size: formatBytes(MAX_FILE_BYTES) })}</p>
    </Upload.Dragger>
  )
}
