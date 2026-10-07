/**
 * 导入时自动分类（后端 ArticleClassifier）依赖的五个领域编码。
 * 改动或删除它们不会报错，但之后导入的文章会悄悄失去对应的自动归类，
 * 所以界面上要给出醒目提示。后端新增内置编码时，这里需同步。
 */
export const BUILTIN_CATEGORY_CODES: readonly string[] = ['frontend', 'backend', 'database', 'devops', 'mobile']

export const isBuiltinCategory = (code: string): boolean => BUILTIN_CATEGORY_CODES.includes(code)
