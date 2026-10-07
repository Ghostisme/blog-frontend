import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ResumeContent, ResumeLang } from '../../types/api'
import { adminApi } from '../api'
import { adminKeys, invalidatePublicResume } from '../api/keys'

/**
 * 读取某语言简历用于编辑。每次进入都强制拉最新且不缓存：
 * 表单以此为初始值，用旧缓存会让管理员基于过期内容修改，再整体覆盖掉最新版本。
 */
export const useAdminResume = (lang: ResumeLang) =>
  useQuery({
    queryKey: adminKeys.resume(lang),
    queryFn: () => adminApi.getResume(lang),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

/** 整体覆盖保存简历，成功后让前台 ['resume', lang] 失效以便访客看到新内容。 */
export function useSaveResume(lang: ResumeLang) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ResumeContent) => adminApi.saveResume(lang, body),
    onSuccess: (saved) => {
      qc.setQueryData(adminKeys.resume(lang), saved)
      invalidatePublicResume(qc, lang)
    },
  })
}
