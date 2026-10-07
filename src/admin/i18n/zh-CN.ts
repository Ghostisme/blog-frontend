import { zhArticles } from './zh/articles'
import { zhEditor } from './zh/editor'
import { zhImporter } from './zh/importer'
import { zhResume } from './zh/resume'
import { zhShell } from './zh/shell'
import { zhTaxonomy } from './zh/taxonomy'

/**
 * 后台简体中文文案（'admin' 命名空间）。按功能拆成多个文件再在此合并，单文件保持短小。
 * 这里是键的“权威来源”：en-US 的每一部分都以对应 zh 部分的类型为约束，缺键会在编译期报错。
 */
export const zhCN = {
  ...zhShell,
  ...zhArticles,
  ...zhEditor,
  ...zhImporter,
  ...zhTaxonomy,
  ...zhResume,
}

export type AdminBundle = typeof zhCN
