import { EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { AppLanguage } from '../i18n/language'
import type { ResumeContent } from '../types/api'
import styles from './ResumePaper.module.css'

interface ResumePaperProps {
  data: ResumeContent
  /**
   * 简历自身的语言，与界面语言无关：
   * 用户可以在中文界面下查看英文简历，所以章节标题要按简历语言取文案，而不是跟随界面。
   */
  lng: AppLanguage
}

/** 有内容才渲染的章节容器：空章节直接隐藏，避免简历里出现一堆只有标题的空白块。 */
function Section({ title, show, children }: { title: string; show: boolean; children: React.ReactNode }) {
  if (!show) {
    return null
  }
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Highlights({ items }: { items: string[] }) {
  return items.length > 0 ? <ul className={styles.highlights}>{items.map((h, i) => <li key={i}>{h}</li>)}</ul> : null
}

/** A4 纸张风格的简历主体。打印时去掉外框和阴影，见 ResumePaper.module.css 的 @media print。 */
export function ResumePaper({ data, lng }: ResumePaperProps) {
  const { t } = useTranslation()
  const tr = (key: string) => t(key, { lng })
  const { basics } = data

  const contacts = [
    { icon: <MailOutlined />, text: basics.email, href: basics.email ? `mailto:${basics.email}` : '' },
    { icon: <PhoneOutlined />, text: basics.phone, href: '' },
    { icon: <EnvironmentOutlined />, text: basics.location, href: '' },
    { icon: <GlobalOutlined />, text: basics.website, href: basics.website },
  ].filter((c) => c.text)

  return (
    <article className={styles.paper} lang={lng}>
      <header className={styles.header}>
        {basics.avatarUrl && <img className={styles.avatar} src={basics.avatarUrl} alt="" referrerPolicy="no-referrer" />}
        <div>
          <h1 className="gradient-text">{basics.name}</h1>
          <p className={styles.jobTitle}>{basics.title}</p>
          <ul className={styles.contacts}>
            {contacts.map((c) => (
              <li key={c.text}>
                {c.icon} {c.href ? <a href={c.href}>{c.text}</a> : c.text}
              </li>
            ))}
            {basics.links.filter((l) => l.url).map((l) => (
              <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label || l.url}</a></li>
            ))}
          </ul>
        </div>
      </header>

      <Section title={tr('resume.summary')} show={Boolean(data.summary)}>
        <p className={styles.summary}>{data.summary}</p>
      </Section>

      <Section title={tr('resume.skills')} show={data.skills.length > 0}>
        <dl className={styles.skills}>
          {data.skills.map((g, i) => (
            <div key={i}>
              <dt>{g.name}</dt>
              <dd>{g.items.map((item) => <span key={item}>{item}</span>)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={tr('resume.experience')} show={data.experience.length > 0}>
        {data.experience.map((e, i) => (
          <div key={i} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{e.company}</strong>
              <span>{e.period}</span>
            </div>
            <p className={styles.sub}>{[e.position, e.location].filter(Boolean).join(' · ')}</p>
            <Highlights items={e.highlights} />
          </div>
        ))}
      </Section>

      <Section title={tr('resume.projects')} show={data.projects.length > 0}>
        {data.projects.map((p, i) => (
          <div key={i} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a> : p.name}</strong>
              <span>{p.period}</span>
            </div>
            {p.role && <p className={styles.sub}>{p.role}</p>}
            {p.description && <p className={styles.desc}>{p.description}</p>}
            <Highlights items={p.highlights} />
            {p.techStack.length > 0 && (
              <p className={styles.stack}>
                <em>{tr('resume.techStack')}: </em>{p.techStack.join(' / ')}
              </p>
            )}
          </div>
        ))}
      </Section>

      <Section title={tr('resume.education')} show={data.education.length > 0}>
        {data.education.map((e, i) => (
          <div key={i} className={styles.entry}>
            <div className={styles.entryHead}>
              <strong>{e.school}</strong>
              <span>{e.period}</span>
            </div>
            <p className={styles.sub}>{[e.degree, e.major].filter(Boolean).join(' · ')}</p>
          </div>
        ))}
      </Section>
    </article>
  )
}
