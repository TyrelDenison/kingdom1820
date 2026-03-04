import { describe, it, expect } from 'vitest'
import {
  calculateAnnualPriceRange,
  calculateMonthlyPriceRange,
  calculateMeetingLengthRange,
  calculateAttendanceRange,
} from '../../src/lib/programRanges'

describe('calculateAnnualPriceRange', () => {
  it('returns null for price of 0 (free)', () => {
    expect(calculateAnnualPriceRange(0)).toBeNull()
  })

  it('returns 0-240 for price of 1', () => {
    expect(calculateAnnualPriceRange(1)).toBe('0-240')
  })

  it('returns 0-240 for price at upper boundary (240)', () => {
    expect(calculateAnnualPriceRange(240)).toBe('0-240')
  })

  it('returns 241-600 for price just above first boundary (241)', () => {
    expect(calculateAnnualPriceRange(241)).toBe('241-600')
  })

  it('returns 241-600 for price at upper boundary (600)', () => {
    expect(calculateAnnualPriceRange(600)).toBe('241-600')
  })

  it('returns 601-2400 for price just above second boundary (601)', () => {
    expect(calculateAnnualPriceRange(601)).toBe('601-2400')
  })

  it('returns 601-2400 for price at upper boundary (2400)', () => {
    expect(calculateAnnualPriceRange(2400)).toBe('601-2400')
  })

  it('returns 2401-8400 for price just above third boundary (2401)', () => {
    expect(calculateAnnualPriceRange(2401)).toBe('2401-8400')
  })

  it('returns 2401-8400 for price at upper boundary (8400)', () => {
    expect(calculateAnnualPriceRange(8400)).toBe('2401-8400')
  })

  it('returns 8401+ for price just above fourth boundary (8401)', () => {
    expect(calculateAnnualPriceRange(8401)).toBe('8401+')
  })

  it('returns 8401+ for very large price', () => {
    expect(calculateAnnualPriceRange(50000)).toBe('8401+')
  })
})

describe('calculateMonthlyPriceRange', () => {
  it('returns null for price of 0', () => {
    expect(calculateMonthlyPriceRange(0)).toBeNull()
  })

  it('returns 0-20 for price of 1', () => {
    expect(calculateMonthlyPriceRange(1)).toBe('0-20')
  })

  it('returns 0-20 at upper boundary (20)', () => {
    expect(calculateMonthlyPriceRange(20)).toBe('0-20')
  })

  it('returns 21-50 just above first boundary (21)', () => {
    expect(calculateMonthlyPriceRange(21)).toBe('21-50')
  })

  it('returns 21-50 at upper boundary (50)', () => {
    expect(calculateMonthlyPriceRange(50)).toBe('21-50')
  })

  it('returns 51-200 just above second boundary (51)', () => {
    expect(calculateMonthlyPriceRange(51)).toBe('51-200')
  })

  it('returns 51-200 at upper boundary (200)', () => {
    expect(calculateMonthlyPriceRange(200)).toBe('51-200')
  })

  it('returns 201-700 just above third boundary (201)', () => {
    expect(calculateMonthlyPriceRange(201)).toBe('201-700')
  })

  it('returns 201-700 at upper boundary (700)', () => {
    expect(calculateMonthlyPriceRange(700)).toBe('201-700')
  })

  it('returns 701+ just above fourth boundary (701)', () => {
    expect(calculateMonthlyPriceRange(701)).toBe('701+')
  })

  it('returns 701+ for very large price', () => {
    expect(calculateMonthlyPriceRange(5000)).toBe('701+')
  })
})

describe('calculateMeetingLengthRange', () => {
  it('returns null for 0 hours', () => {
    expect(calculateMeetingLengthRange(0)).toBeNull()
  })

  it('returns null for negative hours', () => {
    expect(calculateMeetingLengthRange(-1)).toBeNull()
  })

  it('returns 1-2 for a short meeting (1 hour)', () => {
    expect(calculateMeetingLengthRange(1)).toBe('1-2')
  })

  it('returns 1-2 at upper boundary (2 hours)', () => {
    expect(calculateMeetingLengthRange(2)).toBe('1-2')
  })

  it('returns 1-2 for fractional hours under 2 (1.5)', () => {
    expect(calculateMeetingLengthRange(1.5)).toBe('1-2')
  })

  it('returns 2-4 just above first boundary (2.1 hours)', () => {
    expect(calculateMeetingLengthRange(2.1)).toBe('2-4')
  })

  it('returns 2-4 at upper boundary (4 hours)', () => {
    expect(calculateMeetingLengthRange(4)).toBe('2-4')
  })

  it('returns 4-8 just above second boundary (4.1 hours)', () => {
    expect(calculateMeetingLengthRange(4.1)).toBe('4-8')
  })

  it('returns 4-8 for a full day (7 hours)', () => {
    expect(calculateMeetingLengthRange(7)).toBe('4-8')
  })
})

describe('calculateAttendanceRange', () => {
  it('returns null for 0 attendees', () => {
    expect(calculateAttendanceRange(0)).toBeNull()
  })

  it('returns null for negative count', () => {
    expect(calculateAttendanceRange(-1)).toBeNull()
  })

  it('returns 1-10 for a single attendee', () => {
    expect(calculateAttendanceRange(1)).toBe('1-10')
  })

  it('returns 1-10 at upper boundary (10)', () => {
    expect(calculateAttendanceRange(10)).toBe('1-10')
  })

  it('returns 10-20 just above first boundary (11)', () => {
    expect(calculateAttendanceRange(11)).toBe('10-20')
  })

  it('returns 10-20 at upper boundary (20)', () => {
    expect(calculateAttendanceRange(20)).toBe('10-20')
  })

  it('returns 20-50 just above second boundary (21)', () => {
    expect(calculateAttendanceRange(21)).toBe('20-50')
  })

  it('returns 20-50 at upper boundary (50)', () => {
    expect(calculateAttendanceRange(50)).toBe('20-50')
  })

  it('returns 50-100 just above third boundary (51)', () => {
    expect(calculateAttendanceRange(51)).toBe('50-100')
  })

  it('returns 50-100 at upper boundary (100)', () => {
    expect(calculateAttendanceRange(100)).toBe('50-100')
  })

  it('returns 100+ just above fourth boundary (101)', () => {
    expect(calculateAttendanceRange(101)).toBe('100+')
  })

  it('returns 100+ for large groups', () => {
    expect(calculateAttendanceRange(500)).toBe('100+')
  })
})
