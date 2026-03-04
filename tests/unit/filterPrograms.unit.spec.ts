import { describe, it, expect } from 'vitest'
import { filterPrograms, FilterState } from '../../src/app/(frontend)/programs/ProgramsClient'

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

const programs = [
  {
    id: 1, name: 'Alpha Group', city: 'Austin', state: 'TX',
    religiousAffiliation: 'protestant', meetingFormat: 'in-person',
    meetingFrequency: 'weekly', meetingType: 'peer-group',
    meetingLengthRange: '1-2', averageAttendanceRange: '10-20',
    hasConferences: 'none', hasOutsideSpeakers: true, hasEducationTraining: true,
    annualPriceRange: '241-600', monthlyPriceRange: '21-50',
  },
  {
    id: 2, name: 'Beta Forum', city: 'Dallas', state: 'TX',
    religiousAffiliation: 'catholic', meetingFormat: 'online',
    meetingFrequency: 'monthly', meetingType: 'forum',
    meetingLengthRange: '2-4', averageAttendanceRange: '20-50',
    hasConferences: 'multiple', hasOutsideSpeakers: false, hasEducationTraining: false,
    annualPriceRange: '601-2400', monthlyPriceRange: '51-200',
  },
  {
    id: 3, name: 'Gamma Circle', city: 'Chicago', state: 'IL',
    religiousAffiliation: 'protestant', meetingFormat: 'both',
    meetingFrequency: 'quarterly', meetingType: 'small-group',
    meetingLengthRange: '4-8', averageAttendanceRange: '50-100',
    hasConferences: 'none', hasOutsideSpeakers: false, hasEducationTraining: true,
    annualPriceRange: '2401-8400', monthlyPriceRange: '201-700',
  },
]

describe('filterPrograms — edge cases', () => {
  it('returns empty array for empty programs input', () => {
    expect(filterPrograms([], emptyFilters)).toHaveLength(0)
  })

  it('returns empty array for empty programs input with active filters', () => {
    expect(filterPrograms([], { ...emptyFilters, selectedFormat: 'online' })).toHaveLength(0)
  })

  it('excludes program with missing field when that filter is active', () => {
    const withMissing = [
      { id: 10, name: 'No Format', city: 'Boston', state: 'MA' },
      { id: 11, name: 'Has Format', city: 'Boston', state: 'MA', meetingFormat: 'online' },
    ]
    const result = filterPrograms(withMissing, { ...emptyFilters, selectedFormat: 'online' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(11)
  })

  it('returns all programs when programs have missing fields but no filters active', () => {
    const withMissing = [
      { id: 10, name: 'No Format', city: 'Boston', state: 'MA' },
    ]
    expect(filterPrograms(withMissing, emptyFilters)).toHaveLength(1)
  })
})

describe('filterPrograms — attendance ranges', () => {
  it('filters by attendance range: 10-20', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAttendance: '10-20' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by attendance range: 20-50', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAttendance: '20-50' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('filters by attendance range: 50-100', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAttendance: '50-100' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })
})

describe('filterPrograms — conference options', () => {
  it('filters by conferences: none', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedConferences: 'none' })
    expect(result).toHaveLength(2)
    expect(result.every(p => p.hasConferences === 'none')).toBe(true)
  })

  it('filters by conferences: multiple', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedConferences: 'multiple' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })
})

describe('filterPrograms — annual price ranges', () => {
  it('filters by annual price range: 241-600', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAnnualPriceRange: '241-600' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by annual price range: 601-2400', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAnnualPriceRange: '601-2400' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('filters by annual price range: 2401-8400', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedAnnualPriceRange: '2401-8400' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })
})

describe('filterPrograms — monthly price ranges', () => {
  it('filters by monthly price range: 21-50', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMonthlyPriceRange: '21-50' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by monthly price range: 51-200', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMonthlyPriceRange: '51-200' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('filters by monthly price range: 201-700', () => {
    const result = filterPrograms(programs, { ...emptyFilters, selectedMonthlyPriceRange: '201-700' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })
})

describe('filterPrograms — combined filters', () => {
  it('all active filters with no match returns empty array', () => {
    const result = filterPrograms(programs, {
      searchTerm: 'alpha',
      selectedState: 'IL',
      selectedFormat: 'online',
      selectedFrequency: 'weekly',
      selectedAffiliation: 'protestant',
      selectedMeetingLength: '1-2',
      selectedMeetingType: 'peer-group',
      selectedAttendance: '1-10',
      selectedConferences: 'annual',
      selectedOutsideSpeakers: 'false',
      selectedEducationTraining: 'false',
      selectedAnnualPriceRange: '8401+',
      selectedMonthlyPriceRange: '701+',
    })
    expect(result).toHaveLength(0)
  })

  it('two filters narrow results correctly', () => {
    const result = filterPrograms(programs, {
      ...emptyFilters,
      selectedState: 'TX',
      selectedFormat: 'online',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })
})
