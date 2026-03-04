import { describe, it, expect } from 'vitest'
import { extractCitations } from '../../src/lib/firecrawl'

describe('extractCitations', () => {
  it('returns empty array for null', () => {
    expect(extractCitations(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(extractCitations(undefined)).toEqual([])
  })

  it('returns empty array for a non-object primitive', () => {
    expect(extractCitations('string')).toEqual([])
    expect(extractCitations(42)).toEqual([])
  })

  it('returns empty array for an empty object', () => {
    expect(extractCitations({})).toEqual([])
  })

  it('returns empty array when no citation fields exist', () => {
    expect(extractCitations({ name: 'Alpha', city: 'Austin' })).toEqual([])
  })

  it('extracts a single citation field', () => {
    const result = extractCitations({ name_citation: 'https://example.com' })
    expect(result).toEqual(['https://example.com'])
  })

  it('extracts multiple citation fields from the same object', () => {
    const result = extractCitations({
      name_citation: 'https://example.com/name',
      address_citation: 'https://example.com/address',
    })
    expect(result).toContain('https://example.com/name')
    expect(result).toContain('https://example.com/address')
    expect(result).toHaveLength(2)
  })

  it('ignores non-string citation values', () => {
    const result = extractCitations({
      name_citation: 123,
      city_citation: null,
      state_citation: ['https://example.com'],
    })
    expect(result).toHaveLength(0)
  })

  it('extracts citations from a nested object', () => {
    const result = extractCitations({
      name: 'Alpha',
      details: {
        name_citation: 'https://example.com/nested',
      },
    })
    expect(result).toEqual(['https://example.com/nested'])
  })

  it('extracts citations from deeply nested objects', () => {
    const result = extractCitations({
      a: {
        b: {
          c: {
            name_citation: 'https://example.com/deep',
          },
        },
      },
    })
    expect(result).toEqual(['https://example.com/deep'])
  })

  it('deduplicates identical citation URLs', () => {
    const result = extractCitations({
      name_citation: 'https://example.com',
      city_citation: 'https://example.com',
    })
    expect(result).toEqual(['https://example.com'])
  })

  it('deduplicates across nested levels', () => {
    const result = extractCitations({
      name_citation: 'https://example.com',
      nested: {
        name_citation: 'https://example.com',
      },
    })
    expect(result).toHaveLength(1)
  })

  it('extracts citations from a realistic agent response object', () => {
    const program = {
      name: 'Alpha Business Group',
      name_citation: 'https://alpha.org/about',
      address: '123 Main St',
      address_citation: 'https://alpha.org/contact',
      city: 'Austin',
      state: 'TX',
    }
    const result = extractCitations(program)
    expect(result).toContain('https://alpha.org/about')
    expect(result).toContain('https://alpha.org/contact')
    expect(result).toHaveLength(2)
  })

  it('only matches keys ending in _citation (not containing it mid-string)', () => {
    const result = extractCitations({
      my_citation_note: 'https://example.com',  // contains but does not end with _citation... wait
      // Actually 'my_citation_note' doesn't end with '_citation'
      citation_source: 'https://example.com',   // starts with, doesn't end
      name_citation: 'https://correct.com',     // ends with _citation ✓
    })
    expect(result).toEqual(['https://correct.com'])
  })
})
