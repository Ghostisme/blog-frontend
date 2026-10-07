import { Input, Segmented, Spin } from 'antd'
import { lazy, Suspense, useDeferredValue, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import styles from './editor.module.css'

/**
 * 预览用的渲染器含整套语法高亮，体积大，必须懒加载：
 * 只有打开编辑页才会下载，文章列表等后台页面不受影响。
 */
const Markdown = lazy(() => import('../../../components/Markdown'))

/** 宽屏并排、窄屏切换的分界，与后台外壳的侧栏断点一致。 */
const WIDE_QUERY = '(min-width: 992px)'

type Tab = 'write' | 'preview'

interface MarkdownFieldProps {
  /** 由 Form.Item 注入。 */
  value?: string
  onChange?: (value: string) => void
  /** 由 Form.Item 注入，使点击 label 能聚焦到输入框。 */
  id?: string
}

/**
 * 正文 Markdown 编辑器：左写右预览。
 *
 * 做成自带 value/onChange 的受控组件，而不是在外层 useWatch 正文：
 * useWatch 会让整个表单组件在每次按键时重渲染，正文一长就明显卡顿；
 * 现在每次按键只会重渲染本组件。
 *
 * 预览用 useDeferredValue：输入是高优先级更新，Markdown 解析 + 高亮是低优先级，
 * 长文章输入时不会被预览渲染拖慢。
 */
export function MarkdownField({ value = '', onChange, id }: MarkdownFieldProps) {
  const { t } = useTranslation('admin')
  const wide = useMediaQuery(WIDE_QUERY)
  const [tab, setTab] = useState<Tab>('write')
  const deferred = useDeferredValue(value)

  // 窄屏只显示当前标签页。编辑器始终挂载在 Form.Item 之内，所以不显示预览时表单校验不受影响
  const showEditor = wide || tab === 'write'
  const showPreview = wide || tab === 'preview'

  return (
    <div>
      {!wide && (
        <Segmented<Tab>
          className={styles.tabs}
          block
          value={tab}
          onChange={setTab}
          options={[
            { value: 'write', label: t('editor.write') },
            { value: 'preview', label: t('editor.preview') },
          ]}
        />
      )}
      <div className={wide ? styles.split : undefined}>
        {showEditor && (
          <div className={styles.pane}>
            <Input.TextArea
              id={id}
              value={value}
              spellCheck={false}
              placeholder={t('editor.contentPlaceholder')}
              onChange={(e) => onChange?.(e.target.value)}
            />
          </div>
        )}
        {showPreview && (
          // tabIndex=0：可滚动区域需要能被键盘聚焦，键盘用户才能用方向键滚动预览
          <div className={`${styles.pane} ${styles.preview}`} role="region" aria-label={t('editor.preview')} tabIndex={0}>
            {deferred.trim() ? (
              <Suspense
                fallback={
                  <div className={styles.previewLoading}>
                    <Spin />
                  </div>
                }
              >
                <Markdown content={deferred} />
              </Suspense>
            ) : (
              <p className={styles.previewEmpty}>{t('editor.previewEmpty')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
