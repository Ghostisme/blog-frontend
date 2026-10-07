import {
  isValidElement,
  memo,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import './markdown.css'

type MarkdownOptions = ComponentProps<typeof ReactMarkdown>

const REMARK_PLUGINS: MarkdownOptions['remarkPlugins'] = [remarkGfm]

/**
 * 插件顺序是有意安排的，调换会出问题：
 *  1. rehypeRaw      先把 Markdown 里夹带的原始 HTML（掘金文章常见 <img>、<br>、<details>）解析成节点；
 *  2. rehypeSanitize 再统一清洗：去掉 <script>、onerror 等事件属性、javascript: 链接。
 *                    文章内容来自外部，这一步是防 XSS 的底线，必须排在所有“产生内容”的插件之后、
 *                    所有“只加标记”的插件之前；
 *  3. rehypeSlug     给标题加 id（目录跳转用）。放在清洗之后，因为清洗会给 id 加 user-content- 前缀，
 *                    那样目录里读到的 id 就和实际锚点对不上；
 *  4. rehypeHighlight 最后做语法高亮：它生成的 hljs-* 类名若在清洗之前，会被当作不允许的 class 删掉。
 */
const REHYPE_PLUGINS: MarkdownOptions['rehypePlugins'] = [
  rehypeRaw,
  rehypeSanitize,
  rehypeSlug,
  // ignoreMissing：遇到不认识的语言标记（如 vue）时按纯文本显示，而不是抛错让整篇文章渲染失败
  [rehypeHighlight, { ignoreMissing: true, aliases: { xml: ['vue', 'svelte', 'wxml'] } }],
]

/** 递归取出 React 节点里的纯文本。代码被高亮拆成了很多 <span>，复制时需要还原成原始文本。 */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children)
  }
  return ''
}

type CopyState = 'idle' | 'copied' | 'failed'

/** 代码块：顶部显示语言，右侧提供复制按钮。 */
function CodeBlock({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  // 组件卸载时清掉计时器，避免对已卸载的组件 setState
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const code = isValidElement<{ className?: string }>(children) ? children : null
  const language = /language-([\w-]+)/.exec(code?.props.className ?? '')?.[1]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''))
      setState('copied')
    } catch {
      // 剪贴板 API 只在 HTTPS / localhost 下可用，也可能被用户拒绝
      setState('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 1800)
  }

  const label = state === 'copied' ? t('article.copied') : state === 'failed' ? t('article.copyFailed') : t('article.copy')

  return (
    <div className="md-code">
      <div className="md-code-bar">
        <span className="md-code-lang">{language ?? 'text'}</span>
        <button type="button" className="md-code-copy" onClick={() => void copy()}>
          {label}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  )
}

const COMPONENTS: Components = {
  a({ href, children }) {
    // 站外链接新开标签页；noopener 防止新页面通过 window.opener 操纵本页，nofollow 表明不为其背书
    const external = href !== undefined && /^https?:\/\//i.test(href)
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
        {children}
      </a>
    )
  },
  img({ src, alt, title }) {
    // referrerPolicy=no-referrer：很多图床（含掘金 CDN）按 Referer 做防盗链，
    // 不带来源信息才能在自己的域名下正常显示转载文章里的图片
    return (
      <img
        src={typeof src === 'string' ? src : undefined}
        alt={alt ?? ''}
        title={title}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    )
  },
  // 宽表格在小屏上横向滚动，而不是撑破整个页面
  table: ({ children }) => (
    <div className="md-table-wrap">
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}

interface MarkdownProps {
  content: string
  /**
   * 内容渲染完成后回调，参数是渲染结果的根元素。
   * 文章页用它从真实 DOM 里读取标题生成目录——直接读 DOM 能保证目录里的 id 与
   * rehype-slug 实际生成的完全一致，不必在别处重复实现一遍标题 → id 的转换规则。
   * 调用方应传稳定的回调（useCallback），否则每次渲染都会重复触发。
   */
  onRendered?: (root: HTMLElement) => void
}

/**
 * Markdown 渲染器（前台文章页与后台预览共用）。
 * 体积较大（含语法高亮），使用方应通过 React.lazy 按需加载。
 */
function MarkdownImpl({ content, onRendered }: MarkdownProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rootRef.current) {
      onRendered?.(rootRef.current)
    }
  }, [content, onRendered])

  return (
    <div ref={rootRef} className="markdown-body">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

/**
 * memo：文章页有随滚动变化的状态（目录高亮、阅读进度），父组件会频繁重渲染；
 * 长文章的 Markdown 解析 + 语法高亮开销不小，内容没变就不该重新解析。
 */
export default memo(MarkdownImpl)
