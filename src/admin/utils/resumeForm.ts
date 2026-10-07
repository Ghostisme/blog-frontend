import type {
  ResumeContent,
  ResumeEducation,
  ResumeExperience,
  ResumeLink,
  ResumeProject,
  ResumeSkillGroup,
} from '../../types/api'

/**
 * 简历各字段的长度/数量上限，与后端 ResumeContent 的 @Size 一一对应。
 * 集中放在这里：表单的校验、“添加”按钮的禁用、提示文案都引用同一份，后端调整时只改一处。
 */
export const RESUME_LIMITS = {
  summary: 5000,
  name: 64,
  shortText: 128,
  period: 64,
  email: 128,
  phone: 64,
  website: 256,
  url: 512,
  description: 1000,
  bullet: 500,
  token: 64,
  links: 10,
  skillGroups: 20,
  skillItems: 30,
  experience: 30,
  projects: 30,
  education: 10,
  highlights: 20,
  techStack: 20,
} as const

/**
 * 表单值直接采用 ResumeContent 的结构：字段一一对应，省去一层映射。
 * 注意运行时新增的行、未触碰的字段可能是 undefined（后端历史数据也可能是 null），
 * 所以下面所有函数都按“可能缺失”来写，而不是信任类型。
 */
export type ResumeFormValues = ResumeContent

export const EMPTY_LINK: ResumeLink = { label: '', url: '' }
export const EMPTY_SKILL_GROUP: ResumeSkillGroup = { name: '', items: [] }
export const EMPTY_EXPERIENCE: ResumeExperience = { company: '', position: '', period: '', location: '', highlights: [] }
export const EMPTY_PROJECT: ResumeProject = {
  name: '',
  role: '',
  period: '',
  description: '',
  techStack: [],
  highlights: [],
  url: '',
}
export const EMPTY_EDUCATION: ResumeEducation = { school: '', degree: '', major: '', period: '' }

const text = (value: string | null | undefined): string => value ?? ''
const trimmed = (value: string | null | undefined): string => text(value).trim()
const list = <T>(value: readonly T[] | null | undefined): T[] => (value ? [...value] : [])

/** 字符串数组：逐项 trim 并丢弃空白项。 */
const cleanStrings = (value: readonly string[] | null | undefined): string[] => list(value).map(trimmed).filter(Boolean)

/** 一行里所有字段（含数组）都是空白——通常是点了“添加”却没填的空行。 */
function isBlankRow(row: object): boolean {
  return Object.values(row).every((v) => (Array.isArray(v) ? v.length === 0 : !trimmed(v as string)))
}

const withoutBlankRows = <T extends object>(rows: T[]): T[] => rows.filter((row) => !isBlankRow(row))

/**
 * 后端数据 → 表单初始值。
 * 后端对缺失的 List 已规整为空列表，但字符串字段在历史数据里可能为 null，
 * 受控输入收到 null 会告警，所以统一成空字符串。
 */
export function normalizeResume(raw: ResumeContent | null | undefined): ResumeFormValues {
  const b = raw?.basics
  return {
    basics: {
      name: text(b?.name),
      title: text(b?.title),
      email: text(b?.email),
      phone: text(b?.phone),
      location: text(b?.location),
      website: text(b?.website),
      avatarUrl: text(b?.avatarUrl),
      links: list(b?.links).map((l) => ({ label: text(l.label), url: text(l.url) })),
    },
    summary: text(raw?.summary),
    skills: list(raw?.skills).map((g) => ({ name: text(g.name), items: list(g.items) })),
    experience: list(raw?.experience).map((e) => ({
      company: text(e.company),
      position: text(e.position),
      period: text(e.period),
      location: text(e.location),
      highlights: list(e.highlights),
    })),
    projects: list(raw?.projects).map((p) => ({
      name: text(p.name),
      role: text(p.role),
      period: text(p.period),
      description: text(p.description),
      techStack: list(p.techStack),
      highlights: list(p.highlights),
      url: text(p.url),
    })),
    education: list(raw?.education).map((e) => ({
      school: text(e.school),
      degree: text(e.degree),
      major: text(e.major),
      period: text(e.period),
    })),
  }
}

/**
 * 表单值 → 提交请求：trim 全部文本，丢弃空白行与数组里的空白项。
 * 保存是“整体覆盖”，把空行一并写进去会在前台简历上渲染出空的条目，所以必须在这里清掉。
 */
export function toResumeRequest(values: ResumeFormValues): ResumeContent {
  const b = values.basics
  return {
    basics: {
      name: trimmed(b?.name),
      title: trimmed(b?.title),
      email: trimmed(b?.email),
      phone: trimmed(b?.phone),
      location: trimmed(b?.location),
      website: trimmed(b?.website),
      avatarUrl: trimmed(b?.avatarUrl),
      links: withoutBlankRows(list(b?.links).map((l) => ({ label: trimmed(l.label), url: trimmed(l.url) }))),
    },
    summary: trimmed(values.summary),
    skills: withoutBlankRows(list(values.skills).map((g) => ({ name: trimmed(g.name), items: cleanStrings(g.items) }))),
    experience: withoutBlankRows(
      list(values.experience).map((e) => ({
        company: trimmed(e.company),
        position: trimmed(e.position),
        period: trimmed(e.period),
        location: trimmed(e.location),
        highlights: cleanStrings(e.highlights),
      })),
    ),
    projects: withoutBlankRows(
      list(values.projects).map((p) => ({
        name: trimmed(p.name),
        role: trimmed(p.role),
        period: trimmed(p.period),
        description: trimmed(p.description),
        techStack: cleanStrings(p.techStack),
        highlights: cleanStrings(p.highlights),
        url: trimmed(p.url),
      })),
    ),
    education: withoutBlankRows(
      list(values.education).map((e) => ({
        school: trimmed(e.school),
        degree: trimmed(e.degree),
        major: trimmed(e.major),
        period: trimmed(e.period),
      })),
    ),
  }
}
