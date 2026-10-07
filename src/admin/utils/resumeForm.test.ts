import { describe, expect, it } from 'vitest'
import type { ResumeContent } from '../../types/api'
import { normalizeResume, toResumeRequest } from './resumeForm'

describe('normalizeResume', () => {
  it('fills a missing/empty resume with safe defaults', () => {
    const v = normalizeResume(null)
    expect(v.basics.name).toBe('')
    expect(v.basics.links).toEqual([])
    expect(v.skills).toEqual([])
    expect(v.summary).toBe('')
  })

  it('turns null strings from legacy data into empty strings', () => {
    const raw = { basics: { name: null, links: [{ label: null, url: 'https://a.b' }] } } as unknown as ResumeContent
    const v = normalizeResume(raw)
    expect(v.basics.name).toBe('')
    expect(v.basics.links[0]).toEqual({ label: '', url: 'https://a.b' })
  })
})

describe('toResumeRequest', () => {
  const base = normalizeResume(null)

  it('trims text fields', () => {
    const req = toResumeRequest({ ...base, summary: '  hi  ', basics: { ...base.basics, name: ' Bob ' } })
    expect(req.summary).toBe('hi')
    expect(req.basics.name).toBe('Bob')
  })

  it('drops blank rows that were added but never filled in', () => {
    const req = toResumeRequest({
      ...base,
      basics: { ...base.basics, links: [{ label: '', url: '  ' }, { label: 'GH', url: 'https://github.com/x' }] },
      skills: [{ name: '', items: [] }],
      experience: [{ company: '', position: '', period: '', location: '', highlights: [] }],
      education: [{ school: '', degree: '', major: '', period: '' }],
    })
    expect(req.basics.links).toEqual([{ label: 'GH', url: 'https://github.com/x' }])
    expect(req.skills).toEqual([])
    expect(req.experience).toEqual([])
    expect(req.education).toEqual([])
  })

  it('removes blank highlight / token entries but keeps real ones in order', () => {
    const req = toResumeRequest({
      ...base,
      projects: [
        {
          name: 'P',
          role: '',
          period: '',
          description: '',
          url: '',
          techStack: [' React ', '', '  '],
          highlights: ['a', '   ', 'b'],
        },
      ],
    })
    expect(req.projects[0].techStack).toEqual(['React'])
    expect(req.projects[0].highlights).toEqual(['a', 'b'])
  })

  it('keeps a row that has only a non-empty array', () => {
    const req = toResumeRequest({ ...base, skills: [{ name: '', items: ['Go'] }] })
    expect(req.skills).toEqual([{ name: '', items: ['Go'] }])
  })

  it('is stable: normalizing the request again does not change it (save → refill is lossless)', () => {
    const once = toResumeRequest({ ...base, summary: 'x', skills: [{ name: 'Lang', items: ['TS'] }] })
    expect(toResumeRequest(normalizeResume(once))).toEqual(once)
  })
})
