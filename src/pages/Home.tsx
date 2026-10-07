import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useArticles, useFilters, useResume } from '../api/queries'
import { ArticleCard } from '../components/ArticleCard'
import { CategoryIcon } from '../components/CategoryIcon'
import { ErrorState } from '../components/ErrorState'
import { SectionTitle } from '../components/SectionTitle'
import { SITE } from '../config/site'
import { useLocalizedName } from '../hooks/useLocalized'
import { usePageMeta } from '../hooks/usePageMeta'
import { toResumeLang } from '../i18n/language'
import { ARTICLE_LEVELS } from '../types/api'
import { levelStyle } from '../utils/level'
import styles from './Home.module.css'

/** 首页展示的文章数。 */
const HOME_LIST_SIZE = 6

export default function Home() {
  const { t, i18n } = useTranslation()
  const localized = useLocalizedName()
  const resume = useResume(toResumeLang(i18n.language))
  const filters = useFilters()
  const latest = useArticles({ page: 1, size: HOME_LIST_SIZE, sort: 'LATEST' })
  const popular = useArticles({ page: 1, size: 3, sort: 'HOT' })

  const basics = resume.data?.basics
  // 简历还是占位内容(名字为空)时退回站点名，避免首页出现“你好，我是 ”后面空白
  const name = basics?.name?.trim() || SITE.name
  const intro = resume.data?.summary?.trim() || t('home.defaultIntro')
  const totalArticles = filters.data?.levels.reduce((sum, l) => sum + l.count, 0) ?? 0
  usePageMeta(`${SITE.name} · ${t('site.tagline')}`)

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.hello}>{t('home.hello')}</p>
            <h1 className={`gradient-text ${styles.name}`}>{name}</h1>
            {basics?.title && <p className={styles.role}>{basics.title}</p>}
            <p className={styles.intro}>{intro}</p>
            <div className={styles.cta}>
              <Link to="/articles">
                <Button type="primary" size="large" icon={<ArrowRightOutlined />} iconPlacement="end">
                  {t('home.readArticles')}
                </Button>
              </Link>
              <Link to="/resume">
                <Button size="large">{t('home.viewResume')}</Button>
              </Link>
            </div>
            <dl className={styles.stats}>
              <Stat value={totalArticles} label={t('home.statArticles')} />
              <Stat value={filters.data?.categories.length ?? 0} label={t('home.statTopics')} />
              <Stat value={filters.data?.tags.length ?? 0} label={t('home.statTags')} />
            </dl>
          </div>

          <div className={styles.codeCard} aria-hidden="true">
            <div className={styles.dots}><i /><i /><i /></div>
            <pre>{`const engineer = {
  name: "${name}",
  stack: ["React", "Java", "MySQL"],
  focus: "engineering practice",
  writing: true,
}`}</pre>
          </div>
        </div>
      </section>

      <div className="container">
        <section className={styles.section}>
          <SectionTitle title={t('home.byLevel')} subtitle={t('home.byLevelSub')} />
          <div className={styles.levelGrid}>
            {ARTICLE_LEVELS.map((level) => {
              const count = filters.data?.levels.find((l) => l.level === level)?.count ?? 0
              return (
                <Link key={level} to={`/articles?level=${level}`} className={styles.levelCard} style={levelStyle(level)}>
                  <strong>{t(`level.${level}.name`)}</strong>
                  <span>{t(`level.${level}.desc`)}</span>
                  <em>{t('home.articleCount', { count })}</em>
                </Link>
              )
            })}
          </div>
        </section>

        <section className={styles.section}>
          <SectionTitle title={t('home.byTopic')} subtitle={t('home.byTopicSub')} />
          {filters.isError && <ErrorState error={filters.error} onRetry={() => void filters.refetch()} />}
          <div className={styles.topics}>
            {filters.data?.categories.map((c) => (
              <Link key={c.id} to={`/articles?category=${c.id}`} className={styles.topic}>
                <span className={styles.topicIcon}><CategoryIcon name={c.icon} /></span>
                <span>{localized(c)}</span>
                <em>{c.articleCount}</em>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionTitle
            title={t('home.latest')}
            extra={<Link to="/articles">{t('common.viewAll')} <ArrowRightOutlined /></Link>}
          />
          {latest.isError ? (
            <ErrorState error={latest.error} onRetry={() => void latest.refetch()} />
          ) : latest.isPending ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : latest.data.records.length === 0 ? (
            <p className={styles.empty}>{t('home.noArticlesYet')}</p>
          ) : (
            <div className={styles.grid}>
              {latest.data.records.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        {popular.data && popular.data.records.length > 0 && (
          <section className={styles.section}>
            <SectionTitle title={t('home.popular')} />
            <div className={styles.grid}>
              {popular.data.records.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.stat}>
      <dt>{value}</dt>
      <dd>{label}</dd>
    </div>
  )
}
