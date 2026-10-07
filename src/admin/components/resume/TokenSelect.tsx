import { Select, type SelectProps } from 'antd'

type TokenSelectProps = Omit<SelectProps<string[]>, 'mode' | 'open' | 'options'> & {
  /** 最多几项；与后端 @Size(max) 一致。 */
  max: number
}

/**
 * 纯输入型的标签框：回车或逗号确认一项，没有下拉选项。
 * 基于 Select 的 tags 模式并关闭下拉（open={false}），这样输入体验、键盘操作、无障碍都沿用 antd，
 * 作为 Form.Item 的子控件时 value/onChange 由 Form.Item 注入，经 ...rest 透传给 Select。
 */
export function TokenSelect({ max, ...rest }: TokenSelectProps) {
  return <Select<string[]> mode="tags" open={false} suffixIcon={null} tokenSeparators={[',', '，']} maxCount={max} {...rest} />
}
