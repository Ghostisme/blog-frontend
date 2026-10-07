import type { AdminBundle } from './zh-CN'
import type { DeepString } from './types'
import { enArticles } from './en/articles'
import { enEditor } from './en/editor'
import { enImporter } from './en/importer'
import { enResume } from './en/resume'
import { enShell } from './en/shell'
import { enTaxonomy } from './en/taxonomy'

/** 后台英文文案。类型约束为中文包的结构：少一个键或多一层嵌套都会编译失败。 */
export const enUS: DeepString<AdminBundle> = {
  ...enShell,
  ...enArticles,
  ...enEditor,
  ...enImporter,
  ...enTaxonomy,
  ...enResume,
}
