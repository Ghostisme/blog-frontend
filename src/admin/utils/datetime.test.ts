import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { formatDateTime, fromBackendDateTime, toBackendDateTime } from './datetime'

describe('backend date-time conversion', () => {
  it('formats without timezone or milliseconds', () => {
    expect(toBackendDateTime(dayjs('2026-03-04T05:06:07.890'))).toBe('2026-03-04T05:06:07')
  })

  it('returns null for empty / invalid input', () => {
    expect(toBackendDateTime(null)).toBeNull()
    expect(toBackendDateTime(undefined)).toBeNull()
    expect(toBackendDateTime(dayjs('not a date'))).toBeNull()
    expect(fromBackendDateTime('')).toBeNull()
    expect(fromBackendDateTime('garbage')).toBeNull()
  })

  it('round-trips', () => {
    const iso = '2026-10-07T13:56:03'
    expect(toBackendDateTime(fromBackendDateTime(iso))).toBe(iso)
  })

  it('tolerates fractional seconds from the server', () => {
    expect(fromBackendDateTime('2026-10-07T13:56:03.123456')?.isValid()).toBe(true)
  })
})

describe('formatDateTime', () => {
  it('shows date and time to the minute', () => {
    expect(formatDateTime('2026-10-07T13:56:03')).toBe('2026-10-07 13:56')
  })

  it('is empty for missing values', () => {
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
  })
})
