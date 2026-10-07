import { Input, Segmented } from 'antd'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedName } from '../hooks/useLocalized'
import { ARTICLE_LEVELS, type FilterOptions } from '../types/api'
import type { FilterState } from '../utils/articleFilters'
import { levelStyle } from '../utils/level'
import { CategoryIcon } from './CategoryIcon'
import styles from './FilterBar.module.css'

/** 标签默认只展示前几个，避免标签云把筛选栏撑得过高。 */
const COLLAPSED_TAG_COUNT = 12

interface FilterBarProps {
  state: FilterState
  options: FilterOptions | undefined
  /** 只传需要变化的字段；调用方负责把页码重置为 1 并写回 URL。 */
  onChange: (patch: Partial<FilterState>) => void
}

interface ChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  style?: React.CSSProperties
}

/** 可切换的筛选胶囊。aria-pressed 让读屏软件把它当作“开关按钮”朗读选中状态。 */
function Chip({ active, onClick, children, style }: ChipProps) {
  return (
    <button type="button" className={styles.chip} aria-pressed={active} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  )
}

/** 文章列表的筛选栏：搜索 + 排序 + 难度 / 领域 / 标签。再次点击已选中的胶囊即取消该项。 */
export function FilterBar({ state, options, onChange }: FilterBarProps) {
  const { t } = useTranslation()
  const localized = useLocalizedName()
  const [tagsExpanded, setTagsExpanded] = useState(false)

  // 输入框自己持有文本，提交(回车/点击搜索/清空)才写回 URL；
  // 若每敲一个字都写 URL，会在浏览器历史里堆出一长串无用记录
  const [text, setText] = useState(state.keyword)
  // URL 里的关键词被外部改动(如“清除全部筛选”、浏览器后退)时，输入框要跟着变。
  // 这里用 React 文档推荐的“渲染期间调整 state”，而不是 effect：
  // effect 会先用旧文本渲染一帧再改，造成输入框闪一下旧内容
  const [syncedKeyword, setSyncedKeyword] = useState(state.keyword)
  if (state.keyword !== syncedKeyword) {
    setSyncedKeyword(state.keyword)
    setText(state.keyword)
  }

  const tags = options?.tags ?? []
  // 选中的标签即使排在折叠区之外也要始终可见，否则用户看不到当前为什么只剩这几篇
  const visibleTags = tagsExpanded
    ? tags
    : tags.filter((tag, i) => i < COLLAPSED_TAG_COUNT || tag.id === state.tagId)

  return (
    <div className={`surface ${styles.bar}`}>
      <div className={styles.top}>
        <Input.Search
          className={styles.search}
          value={text}
          allowClear
          maxLength={100}
          placeholder={t('articles.searchPlaceholder')}
          onChange={(e) => setText(e.target.value)}
          onSearch={(value) => onChange({ keyword: value.trim() })}
        />
        <Segmented
          value={state.sort}
          onChange={(sort) => onChange({ sort: sort === 'HOT' ? 'HOT' : 'LATEST' })}
          options={[
            { value: 'LATEST', label: t('articles.sortLatest') },
            { value: 'HOT', label: t('articles.sortHot') },
          ]}
        />
      </div>

      <Row label={t('articles.level')}>
        <Chip active={!state.level} onClick={() => onChange({ level: undefined })}>{t('common.all')}</Chip>
        {ARTICLE_LEVELS.map((level) => (
          <Chip
            key={level}
            style={levelStyle(level)}
            active={state.level === level}
            onClick={() => onChange({ level: state.level === level ? undefined : level })}
          >
            {t(`level.${level}.name`)}
            <em>{options?.levels.find((l) => l.level === level)?.count ?? 0}</em>
          </Chip>
        ))}
      </Row>

      <Row label={t('articles.category')}>
        <Chip active={!state.categoryId} onClick={() => onChange({ categoryId: undefined })}>{t('common.all')}</Chip>
        {options?.categories.map((c) => (
          <Chip
            key={c.id}
            active={state.categoryId === c.id}
            onClick={() => onChange({ categoryId: state.categoryId === c.id ? undefined : c.id })}
          >
            <CategoryIcon name={c.icon} />
            {localized(c)}
            <em>{c.articleCount}</em>
          </Chip>
        ))}
      </Row>

      {tags.length > 0 && (
        <Row label={t('articles.tag')}>
          {visibleTags.map((tag) => (
            <Chip
              key={tag.id}
              active={state.tagId === tag.id}
              onClick={() => onChange({ tagId: state.tagId === tag.id ? undefined : tag.id })}
            >
              #{localized(tag)}
              <em>{tag.articleCount}</em>
            </Chip>
          ))}
          {tags.length > COLLAPSED_TAG_COUNT && (
            <button type="button" className={styles.more} onClick={() => setTagsExpanded((v) => !v)}>
              {tagsExpanded ? t('articles.lessTags') : t('articles.moreTags')}
            </button>
          )}
        </Row>
      )}
    </div>
  )
}
