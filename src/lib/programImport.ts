/**
 * Shared program import utilities for CSV upload and agent prompts
 */

import { Payload } from 'payload'
import { ProgramSchema, type ProgramData } from './firecrawl'

export interface ProgramImportResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ name?: string; row?: number; error: string }>
}

/**
 * Convert a plain text description to Payload richText format
 */
export function convertToRichText(description?: string) {
  if (!description) return undefined

  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              format: 0,
              detail: 0,
              mode: 'normal' as const,
              style: '',
              text: description,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
        },
      ],
      direction: 'ltr' as const,
    },
  }
}

/**
 * Check for duplicate program by name + city + state
 */
export async function findDuplicateProgram(
  payload: Payload,
  name?: string,
  city?: string,
  state?: string
) {
  if (!name || !city || !state) return null

  const existing = await payload.find({
    collection: 'programs',
    where: {
      and: [
        { name: { equals: name } },
        { city: { equals: city } },
        { state: { equals: state } },
      ],
    },
    limit: 1,
  })

  return existing.docs.length > 0 ? existing.docs[0] : null
}

/**
 * Save a single program to the database (create or update)
 */
export async function saveProgram(
  payload: Payload,
  programData: ProgramData,
  sourceUrl?: string
): Promise<{ action: 'created' | 'updated'; id: number | string }> {
  // Check for duplicate
  const existing = await findDuplicateProgram(
    payload,
    programData.name,
    programData.city,
    programData.state
  )

  // Prepare the data
  const dataToSave = {
    ...programData,
    description: convertToRichText(programData.description),
    sourceUrl: sourceUrl || undefined,
  }

  // Remove fields that shouldn't be saved directly
  delete (dataToSave as any).citations
  delete (dataToSave as any).coordinates

  if (existing) {
    // Update existing program
    await payload.update({
      collection: 'programs',
      id: existing.id,
      data: dataToSave,
    })
    return { action: 'updated', id: existing.id }
  } else {
    // Create new program as draft
    const created = await payload.create({
      collection: 'programs',
      draft: true,
      data: dataToSave,
    })
    return { action: 'created', id: created.id }
  }
}

/**
 * Parse CSV content into program data objects
 */
export function parseCSV(csvContent: string): Array<Record<string, string>> {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim())

  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row')
  }

  // Parse header row
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim()
      const value = values[j]?.trim() || ''
      if (header) {
        row[header] = value
      }
    }

    rows.push(row)
  }

  return rows
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true
      } else if (char === ',') {
        // Field separator
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }

  // Don't forget the last field
  result.push(current)

  return result
}

/**
 * Map CSV headers to program fields
 * Supports various common header naming conventions
 */
const headerMappings: Record<string, keyof ProgramData> = {
  // Name variations
  'name': 'name',
  'program_name': 'name',
  'programname': 'name',
  'program name': 'name',
  'organization': 'name',
  'org': 'name',

  // Description variations
  'description': 'description',
  'desc': 'description',
  'about': 'description',

  // Religious affiliation
  'religiousaffiliation': 'religiousAffiliation',
  'religious_affiliation': 'religiousAffiliation',
  'religious affiliation': 'religiousAffiliation',
  'affiliation': 'religiousAffiliation',
  'religion': 'religiousAffiliation',

  // Address
  'address': 'address',
  'street_address': 'address',
  'street address': 'address',
  'street': 'address',

  // City
  'city': 'city',

  // State
  'state': 'state',
  'st': 'state',

  // Zip
  'zipcode': 'zipCode',
  'zip_code': 'zipCode',
  'zip code': 'zipCode',
  'zip': 'zipCode',
  'postal_code': 'zipCode',
  'postal code': 'zipCode',

  // Meeting format
  'meetingformat': 'meetingFormat',
  'meeting_format': 'meetingFormat',
  'meeting format': 'meetingFormat',
  'format': 'meetingFormat',

  // Meeting frequency
  'meetingfrequency': 'meetingFrequency',
  'meeting_frequency': 'meetingFrequency',
  'meeting frequency': 'meetingFrequency',
  'frequency': 'meetingFrequency',

  // Meeting length
  'meetinglength': 'meetingLength',
  'meeting_length': 'meetingLength',
  'meeting length': 'meetingLength',
  'length': 'meetingLength',
  'duration': 'meetingLength',

  // Meeting type
  'meetingtype': 'meetingType',
  'meeting_type': 'meetingType',
  'meeting type': 'meetingType',
  'type': 'meetingType',

  // Average attendance
  'averageattendance': 'averageAttendance',
  'average_attendance': 'averageAttendance',
  'average attendance': 'averageAttendance',
  'attendance': 'averageAttendance',
  'avg_attendance': 'averageAttendance',

  // Conferences
  'hasconferences': 'hasConferences',
  'has_conferences': 'hasConferences',
  'has conferences': 'hasConferences',
  'conferences': 'hasConferences',

  // Outside speakers
  'hasoutsidespeakers': 'hasOutsideSpeakers',
  'has_outside_speakers': 'hasOutsideSpeakers',
  'has outside speakers': 'hasOutsideSpeakers',
  'outside_speakers': 'hasOutsideSpeakers',
  'outside speakers': 'hasOutsideSpeakers',
  'speakers': 'hasOutsideSpeakers',

  // Education training
  'haseducationtraining': 'hasEducationTraining',
  'has_education_training': 'hasEducationTraining',
  'has education training': 'hasEducationTraining',
  'education_training': 'hasEducationTraining',
  'education training': 'hasEducationTraining',
  'training': 'hasEducationTraining',
  'education': 'hasEducationTraining',

  // Pricing
  'annualprice': 'annualPrice',
  'annual_price': 'annualPrice',
  'annual price': 'annualPrice',
  'yearly_price': 'annualPrice',
  'yearly price': 'annualPrice',
  'monthlyprice': 'monthlyPrice',
  'monthly_price': 'monthlyPrice',
  'monthly price': 'monthlyPrice',

  // Contact
  'contactemail': 'contactEmail',
  'contact_email': 'contactEmail',
  'contact email': 'contactEmail',
  'email': 'contactEmail',
  'contactphone': 'contactPhone',
  'contact_phone': 'contactPhone',
  'contact phone': 'contactPhone',
  'phone': 'contactPhone',

  // Website
  'website': 'website',
  'url': 'website',
  'site': 'website',
  'web': 'website',
}

/**
 * Convert CSV row to ProgramData
 */
export function csvRowToProgramData(row: Record<string, string>): ProgramData {
  const program: Record<string, any> = {}

  for (const [header, value] of Object.entries(row)) {
    const normalizedHeader = header.toLowerCase().trim()
    const fieldName = headerMappings[normalizedHeader]

    if (fieldName && value) {
      // Handle type conversions based on field
      switch (fieldName) {
        case 'meetingLength':
        case 'averageAttendance':
        case 'annualPrice':
        case 'monthlyPrice':
          const numVal = parseFloat(value)
          if (!isNaN(numVal)) {
            program[fieldName] = numVal
          }
          break

        case 'hasOutsideSpeakers':
        case 'hasEducationTraining':
          // Handle boolean fields
          const lowerVal = value.toLowerCase()
          program[fieldName] = ['true', 'yes', '1', 'y'].includes(lowerVal)
          break

        case 'religiousAffiliation':
          // Normalize religious affiliation
          const affiliation = value.toLowerCase()
          if (affiliation.includes('catholic')) {
            program[fieldName] = 'catholic'
          } else if (affiliation.includes('protestant') || affiliation.includes('christian')) {
            program[fieldName] = 'protestant'
          }
          break

        case 'meetingFormat':
          // Normalize meeting format
          const format = value.toLowerCase()
          if (format.includes('both') || format.includes('hybrid')) {
            program[fieldName] = 'both'
          } else if (format.includes('online') || format.includes('virtual') || format.includes('remote')) {
            program[fieldName] = 'online'
          } else if (format.includes('in-person') || format.includes('in person') || format.includes('person')) {
            program[fieldName] = 'in-person'
          }
          break

        case 'meetingFrequency':
          // Normalize meeting frequency
          const freq = value.toLowerCase()
          if (freq.includes('week')) {
            program[fieldName] = 'weekly'
          } else if (freq.includes('month')) {
            program[fieldName] = 'monthly'
          } else if (freq.includes('quarter')) {
            program[fieldName] = 'quarterly'
          }
          break

        case 'meetingType':
          // Normalize meeting type
          const mtype = value.toLowerCase()
          if (mtype.includes('peer') || mtype.includes('group')) {
            program[fieldName] = 'peer-group'
          } else if (mtype.includes('forum') || mtype.includes('speaker') || mtype.includes('q&a')) {
            program[fieldName] = 'forum'
          } else if (mtype.includes('small') || mtype.includes('discussion')) {
            program[fieldName] = 'small-group'
          }
          break

        case 'hasConferences':
          // Normalize conference value
          const conf = value.toLowerCase()
          if (conf.includes('multiple') || conf.includes('many')) {
            program[fieldName] = 'multiple'
          } else if (conf.includes('annual') || conf.includes('yearly') || conf.includes('one') || ['true', 'yes', '1', 'y'].includes(conf)) {
            program[fieldName] = 'annual'
          } else {
            program[fieldName] = 'none'
          }
          break

        case 'state':
          // Normalize state to uppercase 2-letter code
          const stateVal = value.toUpperCase().trim()
          if (/^[A-Z]{2}$/.test(stateVal)) {
            program[fieldName] = stateVal
          }
          break

        default:
          // String fields - just assign directly
          program[fieldName] = value
      }
    }
  }

  return program as ProgramData
}

/**
 * Validate program data and return validation errors
 */
export function validateProgramData(program: ProgramData, rowNumber: number): string[] {
  const errors: string[] = []

  // Required fields
  if (!program.name) {
    errors.push('Missing required field: name')
  }
  if (!program.religiousAffiliation) {
    errors.push('Missing or invalid religiousAffiliation (must be "protestant" or "catholic")')
  }
  if (!program.address) {
    errors.push('Missing required field: address')
  }
  if (!program.city) {
    errors.push('Missing required field: city')
  }
  if (!program.state) {
    errors.push('Missing required field: state')
  } else if (!/^[A-Z]{2}$/.test(program.state)) {
    errors.push('State must be a 2-letter code (e.g., CA, NY)')
  }
  if (!program.zipCode) {
    errors.push('Missing required field: zipCode')
  } else if (!/^\d{5}(-\d{4})?$/.test(program.zipCode)) {
    errors.push('Invalid zipCode format (must be 5 digits or 5+4 format)')
  }
  if (!program.meetingFormat) {
    errors.push('Missing or invalid meetingFormat (must be "in-person", "online", or "both")')
  }
  if (!program.meetingFrequency) {
    errors.push('Missing or invalid meetingFrequency (must be "weekly", "monthly", or "quarterly")')
  }
  if (!program.meetingType) {
    errors.push('Missing or invalid meetingType (must be "peer-group", "forum", or "small-group")')
  }

  // Validate using Zod schema for additional checks
  const result = ProgramSchema.safeParse(program)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors.some(e => e.includes(path))) {
        errors.push(`${path}: ${issue.message}`)
      }
    }
  }

  return errors
}

/**
 * Import programs from CSV data
 */
export async function importProgramsFromCSV(
  payload: Payload,
  csvContent: string,
  onProgress?: (current: number, total: number, programName?: string) => void
): Promise<ProgramImportResult> {
  const stats: ProgramImportResult = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
  }

  // Parse CSV
  let rows: Array<Record<string, string>>
  try {
    rows = parseCSV(csvContent)
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  stats.total = rows.length

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2 // +2 because row 1 is header, and we're 0-indexed

    try {
      // Convert CSV row to program data
      const programData = csvRowToProgramData(row)

      // Validate
      const validationErrors = validateProgramData(programData, rowNumber)
      if (validationErrors.length > 0) {
        stats.failed++
        stats.errors.push({
          name: programData.name,
          row: rowNumber,
          error: validationErrors.join('; '),
        })
        continue
      }

      // Report progress
      onProgress?.(i + 1, rows.length, programData.name)

      // Save program
      const result = await saveProgram(payload, programData)

      if (result.action === 'created') {
        stats.created++
        console.log(`Created: ${programData.name} (row ${rowNumber})`)
      } else {
        stats.updated++
        console.log(`Updated: ${programData.name} (row ${rowNumber})`)
      }
    } catch (error) {
      stats.failed++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      stats.errors.push({
        name: row['name'] || row['Name'] || row['program_name'],
        row: rowNumber,
        error: errorMessage,
      })
      console.error(`Failed row ${rowNumber}:`, errorMessage)
    }
  }

  return stats
}
