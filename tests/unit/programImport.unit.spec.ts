import { describe, it, expect } from 'vitest'
import {
  convertToRichText,
  parseCSV,
  csvRowToProgramData,
  validateProgramData,
} from '../../src/lib/programImport'

// ---------------------------------------------------------------------------
// convertToRichText
// ---------------------------------------------------------------------------
describe('convertToRichText', () => {
  it('returns undefined for undefined input', () => {
    expect(convertToRichText(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(convertToRichText('')).toBeUndefined()
  })

  it('returns a richText object for a non-empty string', () => {
    const result = convertToRichText('Hello world')
    expect(result).toBeDefined()
    expect(result?.root).toBeDefined()
  })

  it('wraps text in the correct Lexical structure', () => {
    const result = convertToRichText('Test description')!
    expect(result.root.type).toBe('root')
    expect(result.root.children).toHaveLength(1)
    const paragraph = result.root.children[0]
    expect(paragraph.type).toBe('paragraph')
    expect(paragraph.children[0].type).toBe('text')
    expect(paragraph.children[0].text).toBe('Test description')
  })

  it('preserves the exact text including special characters', () => {
    const text = 'Faith & Business: "Growing Together"'
    const result = convertToRichText(text)!
    expect(result.root.children[0].children[0].text).toBe(text)
  })
})

// ---------------------------------------------------------------------------
// parseCSV
// ---------------------------------------------------------------------------
describe('parseCSV', () => {
  it('throws if there is no data row', () => {
    expect(() => parseCSV('name,city')).toThrow()
  })

  it('throws for an empty string', () => {
    expect(() => parseCSV('')).toThrow()
  })

  it('parses a simple CSV into an array of objects', () => {
    const result = parseCSV('name,city\nAlpha Group,Austin')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'Alpha Group', city: 'Austin' })
  })

  it('parses multiple rows', () => {
    const result = parseCSV('name,city\nAlpha,Austin\nBeta,Dallas')
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Alpha')
    expect(result[1].name).toBe('Beta')
  })

  it('handles CRLF line endings', () => {
    const result = parseCSV('name,city\r\nAlpha,Austin')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ name: 'Alpha', city: 'Austin' })
  })

  it('ignores trailing empty lines', () => {
    const result = parseCSV('name,city\nAlpha,Austin\n\n')
    expect(result).toHaveLength(1)
  })

  it('handles quoted values containing commas', () => {
    const result = parseCSV('name,city\n"Alpha, Inc",Austin')
    expect(result[0].name).toBe('Alpha, Inc')
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    const result = parseCSV('name\n"He said ""hello"""')
    expect(result[0].name).toBe('He said "hello"')
  })

  it('stores empty fields as empty strings', () => {
    const result = parseCSV('name,city\nAlpha,')
    expect(result[0].city).toBe('')
  })

  it('trims whitespace from header names', () => {
    const result = parseCSV(' name , city \nAlpha,Austin')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('city')
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — header alias mapping
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — header aliases', () => {
  it('maps program_name to name', () => {
    expect(csvRowToProgramData({ program_name: 'Alpha' }).name).toBe('Alpha')
  })

  it('maps organization to name', () => {
    expect(csvRowToProgramData({ organization: 'Alpha' }).name).toBe('Alpha')
  })

  it('maps zip to zipCode', () => {
    expect(csvRowToProgramData({ name: 'X', zip: '78701' }).zipCode).toBe('78701')
  })

  it('maps address.city to city', () => {
    expect(csvRowToProgramData({ 'address.city': 'Austin' }).city).toBe('Austin')
  })

  it('maps address.state to state', () => {
    expect(csvRowToProgramData({ 'address.state': 'TX' }).state).toBe('TX')
  })

  it('ignores unrecognised header names', () => {
    const result = csvRowToProgramData({ unknown_column: 'value' })
    expect(result.name).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — meetingLength conversion
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — meetingLength', () => {
  it('parses a plain numeric string', () => {
    expect(csvRowToProgramData({ length: '2' }).meetingLength).toBe(2)
  })

  it('parses a decimal numeric string', () => {
    expect(csvRowToProgramData({ length: '1.5' }).meetingLength).toBe(1.5)
  })

  it('parses "Full Day" as 7 hours', () => {
    expect(csvRowToProgramData({ length: 'Full Day (usually 8am - 3pm)' }).meetingLength).toBe(7)
  })

  it('parses "Half Day" as 4 hours', () => {
    expect(csvRowToProgramData({ length: 'Half Day' }).meetingLength).toBe(4)
  })

  it('parses "3 hours" as 3', () => {
    expect(csvRowToProgramData({ length: '3 hours' }).meetingLength).toBe(3)
  })

  it('parses "2.5 hours" as 2.5', () => {
    expect(csvRowToProgramData({ length: '2.5 hours' }).meetingLength).toBe(2.5)
  })

  it('ignores an unrecognisable string', () => {
    expect(csvRowToProgramData({ length: 'varies' }).meetingLength).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — meetingFrequency conversion
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — meetingFrequency', () => {
  it('maps "Weekly" to weekly', () => {
    expect(csvRowToProgramData({ frequency: 'Weekly' }).meetingFrequency).toBe('weekly')
  })

  it('maps "Every week" to weekly', () => {
    expect(csvRowToProgramData({ frequency: 'Every week' }).meetingFrequency).toBe('weekly')
  })

  it('maps "Bi-Monthly" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Bi-Monthly' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "Every other month" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Every other month' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "Twice a month" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Twice a month' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "2x/month" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: '2x/month' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "1st and 3rd Thursday" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: '1st and 3rd Thursday' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "2nd and 4th Tuesday" to bi-monthly', () => {
    expect(csvRowToProgramData({ frequency: '2nd and 4th Tuesday' }).meetingFrequency).toBe('bi-monthly')
  })

  it('maps "Monthly" to monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Monthly' }).meetingFrequency).toBe('monthly')
  })

  it('maps "Third Thursday of every month" to monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Third Thursday of every month' }).meetingFrequency).toBe('monthly')
  })

  it('maps "Fourth Tuesday" to monthly', () => {
    expect(csvRowToProgramData({ frequency: 'Fourth Tuesday' }).meetingFrequency).toBe('monthly')
  })

  it('maps "Quarterly" to quarterly', () => {
    expect(csvRowToProgramData({ frequency: 'Quarterly' }).meetingFrequency).toBe('quarterly')
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — meetingFormat conversion
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — meetingFormat', () => {
  it('maps "In-Person" to in-person', () => {
    expect(csvRowToProgramData({ format: 'In-Person' }).meetingFormat).toBe('in-person')
  })

  it('maps "In Person" to in-person', () => {
    expect(csvRowToProgramData({ format: 'In Person' }).meetingFormat).toBe('in-person')
  })

  it('maps "Online" to online', () => {
    expect(csvRowToProgramData({ format: 'Online' }).meetingFormat).toBe('online')
  })

  it('maps "Virtual" to online', () => {
    expect(csvRowToProgramData({ format: 'Virtual' }).meetingFormat).toBe('online')
  })

  it('maps "Remote" to online', () => {
    expect(csvRowToProgramData({ format: 'Remote' }).meetingFormat).toBe('online')
  })

  it('maps "Both" to both', () => {
    expect(csvRowToProgramData({ format: 'Both' }).meetingFormat).toBe('both')
  })

  it('maps "Hybrid" to both', () => {
    expect(csvRowToProgramData({ format: 'Hybrid' }).meetingFormat).toBe('both')
  })

  it('defaults to in-person and infers meetingType for "Peer Advisory Round Table"', () => {
    const result = csvRowToProgramData({ format: 'Peer Advisory Round Table' })
    expect(result.meetingFormat).toBe('in-person')
    expect(result.meetingType).toBe('peer-group')
  })

  it('defaults to in-person and infers meetingType for "Confidential Forum"', () => {
    const result = csvRowToProgramData({ format: 'Confidential Forum' })
    expect(result.meetingFormat).toBe('in-person')
    expect(result.meetingType).toBe('forum')
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — boolean fields
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — boolean fields', () => {
  it('maps "true" to true', () => {
    expect(csvRowToProgramData({ speakers: 'true' }).hasOutsideSpeakers).toBe(true)
  })

  it('maps "yes" to true', () => {
    expect(csvRowToProgramData({ speakers: 'yes' }).hasOutsideSpeakers).toBe(true)
  })

  it('maps "1" to true', () => {
    expect(csvRowToProgramData({ speakers: '1' }).hasOutsideSpeakers).toBe(true)
  })

  it('maps descriptive truthy text to true', () => {
    expect(csvRowToProgramData({ speakers: 'Yes, we bring in industry experts' }).hasOutsideSpeakers).toBe(true)
  })

  it('maps "false" to false', () => {
    expect(csvRowToProgramData({ speakers: 'false' }).hasOutsideSpeakers).toBe(false)
  })

  it('maps "no" to false', () => {
    expect(csvRowToProgramData({ speakers: 'no' }).hasOutsideSpeakers).toBe(false)
  })

  it('maps "0" to false', () => {
    expect(csvRowToProgramData({ speakers: '0' }).hasOutsideSpeakers).toBe(false)
  })

  it('maps "n/a" to false', () => {
    expect(csvRowToProgramData({ speakers: 'n/a' }).hasOutsideSpeakers).toBe(false)
  })

  it('maps "none" to false', () => {
    expect(csvRowToProgramData({ speakers: 'none' }).hasOutsideSpeakers).toBe(false)
  })

  it('applies the same logic to hasEducationTraining', () => {
    expect(csvRowToProgramData({ education: 'yes' }).hasEducationTraining).toBe(true)
    expect(csvRowToProgramData({ education: 'no' }).hasEducationTraining).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — religiousAffiliation
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — religiousAffiliation', () => {
  it('maps "Protestant" to protestant', () => {
    expect(csvRowToProgramData({ affiliation: 'Protestant' }).religiousAffiliation).toBe('protestant')
  })

  it('maps "Christian" to protestant', () => {
    expect(csvRowToProgramData({ affiliation: 'Christian' }).religiousAffiliation).toBe('protestant')
  })

  it('maps "Catholic" to catholic', () => {
    expect(csvRowToProgramData({ affiliation: 'Catholic' }).religiousAffiliation).toBe('catholic')
  })

  it('maps "Roman Catholic" to catholic', () => {
    expect(csvRowToProgramData({ affiliation: 'Roman Catholic' }).religiousAffiliation).toBe('catholic')
  })

  it('leaves religiousAffiliation unset for unrecognised values', () => {
    expect(csvRowToProgramData({ affiliation: 'Jewish' }).religiousAffiliation).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — state normalisation
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — state', () => {
  it('accepts an uppercase 2-letter code', () => {
    expect(csvRowToProgramData({ state: 'TX' }).state).toBe('TX')
  })

  it('uppercases a lowercase 2-letter code', () => {
    expect(csvRowToProgramData({ state: 'tx' }).state).toBe('TX')
  })

  it('ignores a full state name', () => {
    expect(csvRowToProgramData({ state: 'Texas' }).state).toBeUndefined()
  })

  it('ignores a 3-letter code', () => {
    expect(csvRowToProgramData({ state: 'TEX' }).state).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — pricing
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — pricing', () => {
  it('parses a plain dollar amount', () => {
    expect(csvRowToProgramData({ annual_price: '$1,200' }).annualPrice).toBe(1200)
  })

  it('takes the lower bound of a price range', () => {
    expect(csvRowToProgramData({ annual_price: '$1,000 - $2,000 per year' }).annualPrice).toBe(1000)
  })

  it('parses "Free" as 0', () => {
    expect(csvRowToProgramData({ annual_price: 'Free' }).annualPrice).toBe(0)
  })

  it('parses "N/A" as 0', () => {
    expect(csvRowToProgramData({ annual_price: 'N/A' }).annualPrice).toBe(0)
  })

  it('parses a plain number string', () => {
    expect(csvRowToProgramData({ monthly_price: '150' }).monthlyPrice).toBe(150)
  })

  it('redirects monthly pricing field to annualPrice when value contains "year"', () => {
    const result = csvRowToProgramData({ pricing: '$2,400 per year' })
    expect(result.annualPrice).toBe(2400)
    expect(result.monthlyPrice).toBeUndefined()
  })

  it('stores as monthlyPrice when value does not contain "year"', () => {
    const result = csvRowToProgramData({ pricing: '$200 per month' })
    expect(result.monthlyPrice).toBe(200)
    expect(result.annualPrice).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — hasConferences
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — hasConferences', () => {
  it('maps "multiple" to multiple', () => {
    expect(csvRowToProgramData({ conferences: 'multiple' }).hasConferences).toBe('multiple')
  })

  it('maps "Many" to multiple', () => {
    expect(csvRowToProgramData({ conferences: 'Many' }).hasConferences).toBe('multiple')
  })

  it('maps "annual" to annual', () => {
    expect(csvRowToProgramData({ conferences: 'annual' }).hasConferences).toBe('annual')
  })

  it('maps "yes" to annual', () => {
    expect(csvRowToProgramData({ conferences: 'yes' }).hasConferences).toBe('annual')
  })

  it('maps "true" to annual', () => {
    expect(csvRowToProgramData({ conferences: 'true' }).hasConferences).toBe('annual')
  })

  it('maps "none" to none (not annual)', () => {
    // Regression: 'none'.includes('one') would incorrectly return 'annual'
    expect(csvRowToProgramData({ conferences: 'none' }).hasConferences).toBe('none')
  })

  it('maps "no" to none', () => {
    expect(csvRowToProgramData({ conferences: 'no' }).hasConferences).toBe('none')
  })

  it('maps "false" to none', () => {
    expect(csvRowToProgramData({ conferences: 'false' }).hasConferences).toBe('none')
  })
})

// ---------------------------------------------------------------------------
// csvRowToProgramData — meetingType default
// ---------------------------------------------------------------------------
describe('csvRowToProgramData — meetingType default', () => {
  it('defaults meetingType to peer-group when not set', () => {
    expect(csvRowToProgramData({ name: 'Alpha' }).meetingType).toBe('peer-group')
  })

  it('keeps an explicitly set meetingType', () => {
    expect(csvRowToProgramData({ type: 'forum' }).meetingType).toBe('forum')
  })
})

// ---------------------------------------------------------------------------
// validateProgramData
// ---------------------------------------------------------------------------

const validProgram = {
  name: 'Alpha Group',
  religiousAffiliation: 'protestant' as const,
  city: 'Austin',
  state: 'TX',
  meetingFormat: 'in-person' as const,
  meetingType: 'peer-group' as const,
}

describe('validateProgramData', () => {
  it('returns no errors for a valid program', () => {
    expect(validateProgramData(validProgram, 2)).toHaveLength(0)
  })

  it('reports an error for missing name', () => {
    const errors = validateProgramData({ ...validProgram, name: undefined }, 2)
    expect(errors.some(e => e.includes('name'))).toBe(true)
  })

  it('reports an error for missing religiousAffiliation', () => {
    const errors = validateProgramData({ ...validProgram, religiousAffiliation: undefined }, 2)
    expect(errors.some(e => e.includes('religiousAffiliation'))).toBe(true)
  })

  it('reports an error for missing city', () => {
    const errors = validateProgramData({ ...validProgram, city: undefined }, 2)
    expect(errors.some(e => e.includes('city'))).toBe(true)
  })

  it('reports an error for missing state', () => {
    const errors = validateProgramData({ ...validProgram, state: undefined }, 2)
    expect(errors.some(e => e.includes('state'))).toBe(true)
  })

  it('reports an error for invalid state format', () => {
    const errors = validateProgramData({ ...validProgram, state: 'Texas' }, 2)
    expect(errors.some(e => e.toLowerCase().includes('state'))).toBe(true)
  })

  it('reports an error for missing meetingFormat', () => {
    const errors = validateProgramData({ ...validProgram, meetingFormat: undefined }, 2)
    expect(errors.some(e => e.includes('meetingFormat'))).toBe(true)
  })

  it('accepts a valid 5-digit zipCode', () => {
    expect(validateProgramData({ ...validProgram, zipCode: '78701' }, 2)).toHaveLength(0)
  })

  it('accepts a valid ZIP+4 zipCode', () => {
    expect(validateProgramData({ ...validProgram, zipCode: '78701-1234' }, 2)).toHaveLength(0)
  })

  it('reports an error for an invalid zipCode', () => {
    const errors = validateProgramData({ ...validProgram, zipCode: '7870' }, 2)
    expect(errors.some(e => e.includes('zipCode'))).toBe(true)
  })

  it('reports multiple errors when multiple fields are missing', () => {
    const errors = validateProgramData({ meetingType: 'peer-group' as const }, 2)
    expect(errors.length).toBeGreaterThan(1)
  })
})
