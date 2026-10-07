import { App, Form } from 'antd'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ArticleEditView } from '../../types/api'
import {
  EMPTY_ARTICLE_FORM,
  toArticleFormValues,
  toArticleSaveRequest,
  type ArticleFormValues,
} from '../utils/articleForm'
import { fromBackendDateTime } from '../utils/datetime'
import { useDeleteArticle, useSaveArticle } from './useArticles'
import { useErrorToast } from './useErrorToast'
import { useUnsavedGuard } from './useUnsavedGuard'

/**
 * 文章编辑页的全部行为：表单实例、保存、删除、未保存守卫、Ctrl/⌘+S。
 * 视图组件只负责排版，逻辑集中在这里便于阅读和复用。
 *
 * @param article 编辑已有文章时传入；新建时为 undefined
 */
export function useArticleEditor(article?: ArticleEditView) {
  const { t } = useTranslation('admin')
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const toastError = useErrorToast()
  const [form] = Form.useForm<ArticleFormValues>()
  const { dirty, markDirty, markClean, blocker } = useUnsavedGuard()
  const save = useSaveArticle()
  const remove = useDeleteArticle()
  // 每次用户改动自增。保存请求期间用户若继续输入，保存成功后不能把表单标记成“已保存”
  const editSeq = useRef(0)

  // Form 的 initialValues 只在首次挂载时生效；页面以文章 id 作 key，切换文章会整体重建
  const initialValues = useMemo(() => (article ? toArticleFormValues(article) : EMPTY_ARTICLE_FORM), [article])

  const onValuesChange = useCallback(() => {
    editSeq.current += 1
    markDirty()
  }, [markDirty])

  const submit = async (values: ArticleFormValues) => {
    if (save.isPending) {
      return // Ctrl+S 连按或快速双击时，避免并发保存
    }
    const seqAtStart = editSeq.current
    try {
      const saved = await save.mutateAsync({ id: article?.id, body: toArticleSaveRequest(values) })
      void message.success(t('editor.saved'))
      if (!article) {
        // 新建成功：换到该文章的编辑地址（replace，后退不会回到空白的新建页）。
        // 必须先 markClean 再跳转，否则守卫会把这次正常跳转拦下来
        markClean()
        navigate(`/admin/articles/${saved.id}`, { replace: true })
        return
      }
      if (editSeq.current === seqAtStart) {
        markClean()
      }
      // 只回填服务端可能改写的字段（自动生成的 slug、去重后的标签、首次发布补上的时间）。
      // 不整体 reset：保存期间用户可能已经在继续编辑正文，整体覆盖会吞掉这些输入
      form.setFieldsValue({
        slug: saved.slug,
        tags: saved.tags,
        publishedAt: fromBackendDateTime(saved.publishedAt),
      })
    } catch (error) {
      toastError(error)
    }
  }

  const confirmDelete = () => {
    if (!article) {
      return
    }
    modal.confirm({
      title: t('editor.deleteConfirmTitle'),
      content: t('editor.deleteConfirmContent', { title: article.title }),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove.mutateAsync(article.id)
          void message.success(t('articles.deleted'))
          markClean()
          navigate('/admin/articles', { replace: true })
        } catch (error) {
          toastError(error)
        }
      },
    })
  }

  // Ctrl/⌘+S 保存。阻止默认行为，否则浏览器会弹出“另存网页”
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        form.submit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [form])

  return {
    form,
    initialValues,
    dirty,
    blocker,
    saving: save.isPending,
    onValuesChange,
    submit,
    confirmDelete,
  }
}
