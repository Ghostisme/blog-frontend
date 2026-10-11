import { lazy, Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './assistant.module.css'

const Panel = lazy(() => import('./AssistantPanel'))
/** Load the agent, streaming client and rich content only when a visitor opens the assistant. */
export function AssistantLauncher() {
  const { i18n } = useTranslation()
  const zh = i18n.language.startsWith('zh')
  const [opened, setOpened] = useState(false)
  const [visited, setVisited] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const close = () => { setOpened(false); button.current?.focus() }
  return <>
    {visited && <Suspense fallback={opened ? <div className={styles.loadingPanel} role="status">{zh ? '小R正在连接…' : 'Connecting to Little R…'}</div> : null}><Panel open={opened} onClose={close} /></Suspense>}
    <button ref={button} type="button" className={styles.launcher} data-open={opened} aria-expanded={opened} aria-label={zh ? '和小R助手聊聊' : 'Chat with Little R'} onClick={() => { setVisited(true); setOpened(v => !v) }}>
      <span className={styles.launcherLogo}>R<span>✦</span></span><span className={styles.launcherText}>{zh ? '小R助手' : 'Little R'}<small>{zh ? '陪你探索' : 'Explore together'}</small></span><span className={styles.launcherDot} />
    </button>
  </>
}
