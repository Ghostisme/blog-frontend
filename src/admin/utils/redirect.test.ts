import { describe, expect, it } from 'vitest'
import { ADMIN_HOME, resolveRedirectTarget } from './redirect'

describe('resolveRedirectTarget', () => {
  it('returns to the page the user was trying to reach, including its query', () => {
    expect(resolveRedirectTarget({ from: '/admin/articles?status=DRAFT' })).toBe('/admin/articles?status=DRAFT')
    expect(resolveRedirectTarget({ from: '/admin/articles/12' })).toBe('/admin/articles/12')
  })

  it('falls back to the admin home when there is no usable state', () => {
    expect(resolveRedirectTarget(null)).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget(undefined)).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({})).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({ from: 42 })).toBe(ADMIN_HOME)
  })

  it('never redirects outside /admin (open-redirect guard)', () => {
    expect(resolveRedirectTarget({ from: 'https://evil.example/admin/x' })).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({ from: '//evil.example' })).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({ from: '/articles/1' })).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({ from: '/administrator' })).toBe(ADMIN_HOME)
  })

  it('never bounces back to the login page itself', () => {
    expect(resolveRedirectTarget({ from: '/admin/login' })).toBe(ADMIN_HOME)
    expect(resolveRedirectTarget({ from: '/admin/login?x=1' })).toBe(ADMIN_HOME)
  })
})
