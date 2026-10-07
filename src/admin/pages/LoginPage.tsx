import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { RouteFallback } from '../../components/RouteFallback'
import { useAuth } from '../auth/AuthContext'
import { PreferenceSwitches } from '../components/layout/PreferenceSwitches'
import { errorMessage, isApiStatus } from '../utils/error'
import { resolveRedirectTarget } from '../utils/redirect'
import styles from './LoginPage.module.css'

interface LoginForm {
  username: string
  password: string
}

interface LoginFailure {
  message: string
  /** 429：被登录限流锁定。用警告色而不是错误色——用户没做错什么，只需要等。 */
  locked: boolean
}

/** 后台登录页。已登录访问会直接进入后台（或登录前想去的页面）。 */
export default function LoginPage() {
  const { t } = useTranslation('admin')
  const { status, login } = useAuth()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<LoginFailure | null>(null)
  const [form] = Form.useForm<LoginForm>()

  if (status === 'authenticated') {
    return <Navigate to={resolveRedirectTarget(location.state)} replace />
  }
  if (status === 'loading') {
    return <RouteFallback />
  }

  const onFinish = async ({ username, password }: LoginForm) => {
    setSubmitting(true)
    setFailure(null)
    try {
      // 成功后 status 变为 authenticated，上面的 <Navigate> 负责回跳，这里不需要手动 navigate
      await login(username, password)
    } catch (error) {
      // 直接展示后端 message：口令错是“用户名或密码错误”，被锁定是“尝试次数过多，请稍后再试”
      setFailure({ message: errorMessage(error, t('auth.loginFailed')), locked: isApiStatus(error, 429) })
      // 口令错误后清空口令框，用户名保留——减少重输，也避免口令残留在界面上
      form.setFieldValue('password', '')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.prefs}>
        <PreferenceSwitches />
      </div>
      <div className={styles.card}>
        <div className={styles.mark} aria-hidden="true" />
        <h1 className={styles.title}>{t('auth.title')}</h1>
        <p className={styles.subtitle}>{t('auth.subtitle')}</p>

        {failure && (
          <Alert
            className={styles.alert}
            type={failure.locked ? 'warning' : 'error'}
            showIcon
            title={failure.message}
            role="alert"
          />
        )}

        <Form<LoginForm> form={form} layout="vertical" requiredMark={false} onFinish={onFinish} disabled={submitting}>
          <Form.Item
            name="username"
            label={t('auth.username')}
            rules={[{ required: true, whitespace: true, message: t('auth.usernameRequired') }]}
          >
            <Input prefix={<UserOutlined />} autoComplete="username" maxLength={64} autoFocus size="large" />
          </Form.Item>
          <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, message: t('auth.passwordRequired') }]}>
            {/* maxLength 72：BCrypt 的输入上限，后端对更长的口令直接拒绝 */}
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" maxLength={72} size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
            {t('auth.login')}
          </Button>
        </Form>
        <Link className={styles.back} to="/">
          {t('auth.backToSite')}
        </Link>
      </div>
    </div>
  )
}
