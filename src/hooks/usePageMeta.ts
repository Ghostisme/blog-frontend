import { useEffect } from 'react'

/**
 * 设置当前页面的标题和描述。
 *
 * 为什么不直接在页面里写 React 19 的 <title> / <meta>：index.html 里为了让不执行 JS 的爬虫
 * 和链接预览也能拿到默认信息，已经放了一份静态的 title 与 description。
 * React 会把页面里的标签“提升”进 <head>，但不会去替换这份静态标签，结果是 <head> 里出现两份，
 * 爬虫往往取到排在前面的站点默认描述，而不是文章摘要。
 * 所以这里统一改成修改 index.html 里那唯一一份，并在离开页面时还原，始终只有一个标签。
 *
 * @param title       页面标题
 * @param description 页面描述；不传则保持站点默认描述
 */
export function usePageMeta(title: string, description?: string | null): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content
    if (meta && description) {
      meta.content = description
    }

    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== undefined) {
        meta.content = previousDescription
      }
    }
  }, [title, description])
}
