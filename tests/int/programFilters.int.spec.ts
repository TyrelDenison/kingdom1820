import { describe, it, expect } from 'vitest'
import { filterPrograms, FilterState } from '../../src/app/(frontend)/programs/ProgramsClient'

// Controlled dataset covering all filter dimensions
const programs = [
  {
    id: 1, name: 'Alpha Group', city: 'Kansas City', state: 'MO',
    religiousAffiliation: 'protestant', meetingFormat: 'in-person',
    meetingFrequency: 'weekly', meetingType: 'peer-group',
    meetingLengthRange: '1-2', averageAttendanceRange: '1-10',
    hasConferences: 'annual', hasOutsideSpeakers: true, hasEducationTraining: true,
    annualPriceRange: '0-240', monthlyPriceRange: '0-20',
  },
  {
    id: 2, name: 'Beta Forum', city: 'St. Louis', state: 'MO',
    religiousAffiliation: 'catholic', meetingFormat: 'online',
    meetingFrequency: 'monthly', meetingType: 'forum',
    meetingLengthRange: '2-4', averageAttendanceRange: '10-20',
    hasConferences: 'none', hasOutsideSpeakers: false, hasEducationTraining: false,
    annualPriceRange: '241-600', monthlyPriceRange: '21-50',
  },
  {
    id: 3, name: 'Gamma Circle', city: 'Chicago', state: 'IL',
    religiousAffiliation: 'protestant', meetingFormat: 'both',
    meetingFrequency: 'quarterly', meetingType: 'small-group',
    meetingLengthRange: '4-8', averageAttendanceRange: '20-50',
    hasConferences: 'multiple', hasOutsideSpeakers: true, hasEducationTraining: false,
    annualPriceRange: '601-2400', monthlyPriceRange: '51-200',
  },
  {
    id: 4, name: 'Delta Network', city: 'Dallas', state: 'TX',
    religiousAffiliation: 'protestant', meetingFormat: 'in-person',
    meetingFrequency: 'bi-monthly', meetingType: 'peer-group',
    meetingLengthRange: '2-4', averageAttendanceRange: '50-100',
    hasConferences: 'annual', hasOutsideSpeakers: false, hasEducationTraining: true,
    annualPriceRange: '2401-8400', monthlyPriceRange: '201-700',
  },
  {
    id: 5, name: 'Epsilon Assembly', city: 'Houston', state: 'TX',
    religiousAffiliation: 'catholic', meetingFormat: 'online',
    meetingFrequency: 'weekly', meetingType: 'forum',
    meetingLengthRange: '1-2', averageAttendanceRange: '100+',
    hasConferences: 'none', hasOutsideSpeakers: true, hasEducationTraining: true,
    annualPriceRange: '8401+', monthlyPriceRange: '701+',
  },
]

const emptyFilters: FilterState = {
  searchTerm: '',
  selectedState: '',
  selectedFormat: '',
  selectedFrequency: '',
  selectedAffiliation: '',
  selectedMeetingLength: '',
  selectedMeetingType: '',
  selectedAttendance: '',
  selectedConferences: '',
  selectedOutsideSpeakers: '',
  selectedEducationTraining: '',
  selectedAnnualPriceRange: '',
  selectedMonthlyPriceRange: '',
}

describe('filterPrograms', () => {
  it('returns all programs when no filters are set', () => {
    expect(filterPrograms(programs, emptyFilters)).toHaveLength(programs.length)
  })

  it('filters by state', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedState: 'MO' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.state === 'MO')).toBe(true)
  })

  it('filters by meeting format: in-person', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFormat: 'in-person' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingFormat === 'in-person')).toBe(true)
  })

  it('filters by meeting format: online', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFormat: 'online' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingFormat === 'online')).toBe(true)
  })

  it('filters by meeting format: both', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFormat: 'both' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by meeting frequency: weekly', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFrequency: 'weekly' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingFrequency === 'weekly')).toBe(true)
  })

  it('filters by meeting frequency: bi-monthly', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFrequency: 'bi-monthly' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(4)
  })

  it('filters by meeting frequency: monthly', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFrequency: 'monthly' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('filters by meeting frequency: quarterly', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedFrequency: 'quarterly' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by meeting type: peer-group', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingType: 'peer-group' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingType === 'peer-group')).toBe(true)
  })

  it('filters by meeting type: forum', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingType: 'forum' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingType === 'forum')).toBe(true)
  })

  it('filters by meeting type: small-group', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingType: 'small-group' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by meeting length range: 1-2', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingLength: '1-2' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingLengthRange === '1-2')).toBe(true)
  })

  it('filters by meeting length range: 2-4', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingLength: '2-4' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.meetingLengthRange === '2-4')).toBe(true)
  })

  it('filters by meeting length range: 4-8', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMeetingLength: '4-8' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by attendance range: 1-10', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAttendance: '1-10' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by attendance range: 100+', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAttendance: '100+' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(5)
  })

  it('filters by religious affiliation: protestant', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAffiliation: 'protestant' })
    expect(result).toHaveLength(3)
    expect(result.every(p => p.religiousAffiliation === 'protestant')).toBe(true)
  })

  it('filters by religious affiliation: catholic', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAffiliation: 'catholic' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.religiousAffiliation === 'catholic')).toBe(true)
  })

  it('filters by conferences: annual', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedConferences: 'annual' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.hasConferences === 'annual')).toBe(true)
  })

  it('filters by outside speakers: yes', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedOutsideSpeakers: 'true' })
    expect(result).toHaveLength(3)
    expect(result.every(p => p.hasOutsideSpeakers === true)).toBe(true)
  })

  it('filters by outside speakers: no', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedOutsideSpeakers: 'false' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.hasOutsideSpeakers === false)).toBe(true)
  })

  it('filters by education & training: yes', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedEducationTraining: 'true' })
    expect(result).toHaveLength(3)
    expect(result.every(p => p.hasEducationTraining === true)).toBe(true)
  })

  it('filters by education & training: no', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedEducationTraining: 'false' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.hasEducationTraining === false)).toBe(true)
  })

  it('filters by annual price range', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAnnualPriceRange: '0-240' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by monthly price range', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMonthlyPriceRange: '701+' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(5)
  })

  it('filters by search term matching name', () => {
    const result = filterPrograms(programs, { ...emptyFilters, searchTerm: 'Alpha' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by search term matching city', () => {
    const result = filterPrograms(programs, { ...emptyFilters, searchTerm: 'chicago' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by search term matching state', () => {
    const result = filterPrograms(programs, { ...emptyFilters, searchTerm: 'TX' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.state === 'TX')).toBe(true)
  })

  it('search is case-insensitive', () => {
    const result = filterPrograms(programs, { ...emptyFilters, searchTerm: 'alpha' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('returns no results for non-matching search term', () => {
    const result = filterPrograms(programs, { ...emptyFilters, searchTerm: 'zzznomatch' })
    expect(result).toHaveLength(0)
  })

  it('combines multiple filters (state + format)', () => {
    const result = filterPrograms(programs, {
      ...emptyFilters,
      selectedState: 'TX',
      selectedFormat: 'online',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(5)
  })

  it('combines multiple filters (affiliation + meeting type)', () => {
    const result = filterPrograms(programs, {
      ...emptyFilters,
      selectedAffiliation: 'protestant',
      selectedMeetingType: 'peer-group',
    })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.religiousAffiliation === 'protestant' && p.meetingType === 'peer-group')).toBe(true)
  })

  it('returns empty array when combined filters match nothing', () => {
    const result = filterPrograms(programs, {
      ...emptyFilters,
      selectedState: 'MO',
      selectedFormat: 'online',
      selectedFrequency: 'weekly',
    })
    expect(result).toHaveLength(0)
  })

  it('clearing all filters returns all programs', () => {
    // Apply some filters first, then clear
    const filtered = filterPrograms(programs, { ...emptyFilters, selectedState: 'TX', selectedFormat: 'online' })
    expect(filtered).toHaveLength(1)

    const cleared = filterPrograms(programs, emptyFilters)
    expect(cleared).toHaveLength(programs.length)
  })
})
