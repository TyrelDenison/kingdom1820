/**
 * Firecrawl service for web scraping and data extraction using agent endpoint
 */

import Firecrawl from '@mendable/firecrawl-js'
import { z } from 'zod'

/**
 * Zod schema for Program data validation
 * Matches the Programs collection structure
 */
export const ProgramSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  religiousAffiliation: z.enum(['protestant', 'catholic']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // Note: coordinates will be geocoded server-side from address, not requested from Firecrawl
  meetingFormat: z.enum(['in-person', 'online', 'both']).optional(),
  meetingFrequency: z.enum(['weekly', 'bi-monthly', 'monthly', 'quarterly']).optional(),
  meetingLength: z.number().min(0).optional(), // Meeting length in hours
  // Note: meetingLengthRange auto-calculated, not requested from Firecrawl
  meetingType: z.enum(['peer-group', 'forum', 'small-group']).optional(),
  averageAttendance: z.number().min(0).optional(), // Number of attendees
  // Note: averageAttendanceRange auto-calculated, not requested from Firecrawl
  hasConferences: z.enum(['none', 'annual', 'multiple']).optional(),
  hasOutsideSpeakers: z.boolean().optional(),
  hasEducationTraining: z.boolean().optional(),
  annualPrice: z.number().min(0).optional(),
  monthlyPrice: z.number().min(0).optional(),
  // Note: price ranges are auto-calculated, not requested from Firecrawl
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
})

// Infer TypeScript type from Zod schema
export type ProgramData = z.infer<typeof ProgramSchema>

/**
 * Extract all citation URLs from a program object
 * Recursively finds all fields ending in '_citation'
 */
export function extractCitations(obj: any, citations: Set<string> = new Set()): string[] {
  if (!obj || typeof obj !== 'object') return Array.from(citations)

  for (const key in obj) {
    const value = obj[key]

    if (key.endsWith('_citation') && typeof value === 'string') {
      citations.add(value)
    } else if (typeof value === 'object') {
      extractCitations(value, citations)
    }
  }

  return Array.from(citations)
}

// =========================================================================
// Normalization helpers
// The Firecrawl agent often ignores the schema structure and returns nested
// objects with snake_case keys and free-text values instead of enum values.
// These helpers normalize each field to the expected type/value.
// =========================================================================

/** Extract the first 5-digit ZIP code from a string */
function extractZipCode(val: unknown): string | undefined {
  if (!val) return undefined
  const match = String(val).match(/\b\d{5}\b/)
  return match ? match[0] : undefined
}

/** Normalise a US state value to a 2-letter uppercase code */
function normaliseState(val: unknown): string | undefined {
  if (!val) return undefined
  const str = String(val).trim()
  if (/^[A-Za-z]{2}$/.test(str)) return str.toUpperCase()
  const stateMap: Record<string, string> = {
    alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
    colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
    hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
    kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
    massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
    missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH',
    'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
    'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
    'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN',
    texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
    'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  }
  return stateMap[str.toLowerCase()] ?? undefined
}

/** Extract a usable primary city name from a potentially verbose string */
function extractPrimaryCity(val: unknown): string | undefined {
  if (!val) return undefined
  const str = String(val).trim()
  // Short and clean — use as-is after stripping metro/area suffixes
  if (str.length <= 40 && !/multiple|various|locations|cities/i.test(str)) {
    const cleaned = str.replace(/\s*(metro(?:plex)?|area|region|county)\s*$/i, '').trim()
    return cleaned || undefined
  }
  // Longer but clean after stripping suffix (e.g. "Dallas metroplex")
  const suffixStripped = str.replace(/\s*(metro(?:plex)?|area|region|county)\s*$/i, '').trim()
  if (suffixStripped.length <= 40 && !/multiple|various|locations|cities/i.test(suffixStripped)) {
    return suffixStripped || undefined
  }
  // Try "in Dallas" / "in Fort Worth" pattern
  const inMatch = str.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  if (inMatch) return inMatch[1]
  // Take first comma-segment and clean it
  const first = str.split(/[,;]/)[0].trim()
  if (first.length <= 40) {
    return first.replace(/\s*(metro(?:plex)?|area|region)\s*$/i, '').trim() || undefined
  }
  return undefined
}

/** Try to extract city from a full address string like "123 Main St, Dallas, TX 75001" */
function extractCityFromAddress(fullAddress: unknown): string | undefined {
  if (!fullAddress) return undefined
  const parts = String(fullAddress).split(',').map((p) => p.trim())
  // Pattern: [street, city, state zip] — city is second-to-last before state
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 2]
    if (candidate && /^[A-Za-z\s]+$/.test(candidate) && candidate.length <= 40) {
      return candidate
    }
  }
  return undefined
}

/** Map free-text religious affiliation to enum value */
function parseReligiousAffiliation(val: unknown): 'protestant' | 'catholic' | undefined {
  if (!val) return undefined
  const str = String(val).toLowerCase()
  if (str.includes('catholic')) return 'catholic'
  if (
    str.includes('protestant') ||
    str.includes('christian') ||
    str.includes('evangelical') ||
    str.includes('biblical') ||
    str.includes('non-denominational') ||
    str.includes('nondenominational')
  )
    return 'protestant'
  return undefined
}

/** Map free-text meeting format to enum value */
function parseMeetingFormat(val: unknown): 'in-person' | 'online' | 'both' | undefined {
  if (!val) return undefined
  const str = String(val).toLowerCase()
  const hasInPerson =
    str.includes('in-person') ||
    str.includes('in person') ||
    str.includes('face-to-face') ||
    str.includes('physical') ||
    str.includes('location') ||
    str.includes('exclusive')
  const hasOnline =
    str.includes('online') ||
    str.includes('virtual') ||
    str.includes('remote') ||
    str.includes('zoom') ||
    str.includes('web')
  if (hasInPerson && hasOnline) return 'both'
  if (str.includes('both') || str.includes('hybrid')) return 'both'
  if (hasOnline) return 'online'
  if (hasInPerson) return 'in-person'
  return undefined
}

/** Map free-text meeting frequency to enum value */
function parseMeetingFrequency(
  val: unknown,
): 'weekly' | 'bi-monthly' | 'monthly' | 'quarterly' | undefined {
  if (!val) return undefined
  const str = String(val).toLowerCase()
  if (str.includes('weekly') || str.includes('every week') || str.includes('once a week'))
    return 'weekly'
  if (
    str.includes('bi-monthly') ||
    str.includes('bimonthly') ||
    str.includes('bi monthly') ||
    str.includes('twice a month') ||
    str.includes('every two weeks') ||
    str.includes('every other week')
  )
    return 'bi-monthly'
  if (
    str.includes('quarterly') ||
    str.includes('4 times a year') ||
    str.includes('four times a year')
  )
    return 'quarterly'
  if (str.includes('monthly') || str.includes('once a month') || str.includes('each month'))
    return 'monthly'
  return undefined
}

/** Extract meeting length in hours from a free-text string */
function parseMeetingLength(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') return val > 0 ? val : undefined
  const str = String(val).toLowerCase()
  // "7 hours", "1.5 hours", "half-day (4 hours)"
  const hoursMatch = str.match(/(\d+\.?\d*)\s*hour/)
  if (hoursMatch) return parseFloat(hoursMatch[1])
  // "9am to 4pm" style time range
  const timeMatch = str.match(/(\d+)(?::00)?\s*(am|pm)\s+to\s+(\d+)(?::00)?\s*(am|pm)/i)
  if (timeMatch) {
    let start = parseInt(timeMatch[1])
    const startMeridiem = timeMatch[2].toLowerCase()
    let end = parseInt(timeMatch[3])
    const endMeridiem = timeMatch[4].toLowerCase()
    if (startMeridiem === 'pm' && start !== 12) start += 12
    if (startMeridiem === 'am' && start === 12) start = 0
    if (endMeridiem === 'pm' && end !== 12) end += 12
    if (endMeridiem === 'am' && end === 12) end = 0
    return end > start ? end - start : undefined
  }
  return undefined
}

/** Map free-text meeting type to enum value */
function parseMeetingType(val: unknown): 'peer-group' | 'forum' | 'small-group' | undefined {
  if (!val) return undefined
  const str = String(val).toLowerCase()
  if (str.includes('peer') || str.includes('advisory') || str.includes('ceo'))
    return 'peer-group'
  if (str.includes('forum') || str.includes('speaker') || str.includes('q&a')) return 'forum'
  if (str.includes('small') || str.includes('discussion') || str.includes('bible'))
    return 'small-group'
  return undefined
}

/** Extract average per-meeting attendance from a potentially verbose string */
function parseAttendance(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') return val > 0 ? Math.round(val) : undefined
  const str = String(val)
  // Prefer numbers qualified as "per forum/meeting/group"
  const perGroupMatch = str.match(
    /(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:per\s+(?:forum|meeting|group|session)|members?\s+per)/i,
  )
  if (perGroupMatch) {
    const low = parseInt(perGroupMatch[1])
    const high = perGroupMatch[2] ? parseInt(perGroupMatch[2]) : low
    return Math.round((low + high) / 2)
  }
  // "approximately X members"
  const approxMatch = str.match(/approximately\s+(\d+)/i)
  if (approxMatch) return parseInt(approxMatch[1])
  // Fall back: take smallest plausible number (per-meeting, not total membership)
  const numbers = str
    .match(/\d+/g)
    ?.map(Number)
    .filter((n) => n >= 1 && n <= 500)
  if (numbers && numbers.length > 0) {
    const perMeetingSize = numbers.filter((n) => n <= 100)
    return perMeetingSize.length > 0 ? perMeetingSize[0] : numbers[0]
  }
  return undefined
}

/** Map free-text conference value to enum */
function parseHasConferences(val: unknown): 'none' | 'annual' | 'multiple' | undefined {
  if (val === undefined || val === null) return undefined
  if (typeof val === 'boolean') return val ? 'annual' : 'none'
  const str = String(val).toLowerCase().trim()
  if (!str || str === 'none' || str === 'no' || str === 'false' || str === '0') return 'none'
  if (str === 'annual' || str === 'multiple') return str as 'annual' | 'multiple'
  if (str.includes('multiple') || str.includes('several') || str.includes('biennial'))
    return 'multiple'
  if (str.includes('annual') || str.includes('yearly') || str.includes('year')) return 'annual'
  // Any positive/descriptive answer → at least annual
  if (str.includes('yes') || str.includes('true') || str.includes('conference')) return 'annual'
  return 'none'
}

/** Parse a boolean from various representations */
function parseBoolean(val: unknown): boolean | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  const str = String(val).toLowerCase().trim()
  if (str === 'true' || str === 'yes' || str === '1') return true
  if (str === 'false' || str === 'no' || str === 'none' || str === '0') return false
  // Non-empty descriptive string starting affirmatively → true
  if (str.length > 0 && !str.startsWith('no ') && !str.startsWith('not ')) return true
  return undefined
}

/** Extract the first dollar amount from a string */
function parsePrice(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') return val >= 0 ? val : undefined
  const str = String(val).toLowerCase()
  if (str.includes('free') || str.includes('no cost') || str === '0') return 0
  const match = str.match(/\$\s*([\d,]+)/)
  return match ? parseInt(match[1].replace(/,/g, '')) : undefined
}

/** Extract the first valid email address from a comma/semicolon-separated string */
function extractFirstEmail(val: unknown): string | undefined {
  if (!val) return undefined
  const parts = String(val).split(/[,;\s]+/)
  return parts.find((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.trim()))?.trim()
}

/** Extract the first phone number from a string */
function extractFirstPhone(val: unknown): string | undefined {
  if (!val) return undefined
  const match = String(val).match(/[\d(][0-9\s\-()+.]{6,}[\d)]/)
  return match ? match[0].trim() : undefined
}

/**
 * Normalize raw agent output to our flat ProgramData schema.
 *
 * The Firecrawl agent frequently ignores the schema structure and returns:
 * - Nested objects (address, meeting_details, pricing, contact)
 * - snake_case field names (religious_affiliation, outside_speakers)
 * - Free-text values instead of enums ("In-person forums" instead of "in-person")
 * - Descriptive text instead of booleans/numbers ("Yes, featured..." instead of true)
 *
 * This function maps all common variants back to the flat camelCase schema.
 */
export function normalizeAgentData(raw: Record<string, any>): ProgramData {
  // --- Name / Description ---
  const name = raw.name ?? raw.program_name ?? undefined
  const description = raw.description ?? undefined

  // --- Religious Affiliation ---
  const religiousAffiliation = parseReligiousAffiliation(
    raw.religiousAffiliation ?? raw.religious_affiliation,
  )

  // --- Address fields ---
  // Agent may return a nested 'address' object instead of flat fields
  let address: string | undefined
  let city: string | undefined
  let state: string | undefined
  let zipCode: string | undefined

  if (typeof raw.address === 'object' && raw.address !== null) {
    const addrObj = raw.address
    city =
      extractPrimaryCity(addrObj.city) ?? extractCityFromAddress(addrObj.full_address) ?? undefined
    state = normaliseState(addrObj.state)
    zipCode = extractZipCode(addrObj.zip ?? addrObj.zipCode ?? addrObj.postal_code)
    const rawAddr = addrObj.full_address ?? addrObj.street ?? addrObj.address
    address = typeof rawAddr === 'string' ? rawAddr : undefined
  } else {
    address = typeof raw.address === 'string' ? raw.address : undefined
    city = extractPrimaryCity(raw.city)
    state = normaliseState(raw.state)
    zipCode = extractZipCode(raw.zipCode ?? raw.zip_code ?? raw.zip)
  }

  // --- Meeting Details ---
  // Agent may nest these under 'meeting_details'
  const md = (raw.meeting_details ?? raw.meetingDetails ?? {}) as Record<string, unknown>

  const meetingFormat = parseMeetingFormat(raw.meetingFormat ?? raw.meeting_format ?? md.format)
  const meetingFrequency = parseMeetingFrequency(
    raw.meetingFrequency ?? raw.meeting_frequency ?? md.frequency,
  )
  const meetingLength = parseMeetingLength(
    raw.meetingLength ?? raw.meeting_length ?? md.length ?? md.duration,
  )
  const meetingType = parseMeetingType(raw.meetingType ?? raw.meeting_type ?? md.type)
  const averageAttendance = parseAttendance(
    raw.averageAttendance ?? raw.average_attendance ?? md.average_attendance ?? md.averageAttendance,
  )

  // --- Additional Features ---
  const hasConferences = parseHasConferences(
    raw.hasConferences ?? raw.has_conferences ?? raw.conference ?? raw.conferences,
  )
  const hasOutsideSpeakers = parseBoolean(
    raw.hasOutsideSpeakers ?? raw.has_outside_speakers ?? raw.outside_speakers,
  )
  const hasEducationTraining = parseBoolean(
    raw.hasEducationTraining ??
      raw.has_education_training ??
      raw.training_available ??
      raw.training,
  )

  // --- Pricing ---
  // Agent may nest under 'pricing'
  const pricing = (raw.pricing ?? raw.price ?? {}) as Record<string, unknown>
  const annualPrice = parsePrice(
    raw.annualPrice ?? raw.annual_price ?? pricing.annual_fee ?? pricing.annual ?? pricing.yearly_fee,
  )
  const monthlyPrice = parsePrice(
    raw.monthlyPrice ?? raw.monthly_price ?? pricing.monthly_fee ?? pricing.monthly,
  )

  // --- Contact ---
  // Agent may nest under 'contact'
  const contact = (raw.contact ?? raw.contact_info ?? {}) as Record<string, unknown>
  const contactEmail = extractFirstEmail(raw.contactEmail ?? raw.contact_email ?? contact.email)
  const contactPhone = extractFirstPhone(raw.contactPhone ?? raw.contact_phone ?? contact.phone)
  const website =
    typeof (raw.website ?? contact.website ?? contact.url) === 'string'
      ? (raw.website ?? contact.website ?? contact.url)
      : undefined

  // Build result, omitting undefined/empty values so Payload defaults apply
  const result: Record<string, unknown> = {}
  if (name !== undefined) result.name = name
  if (description !== undefined) result.description = description
  if (religiousAffiliation !== undefined) result.religiousAffiliation = religiousAffiliation
  if (address !== undefined) result.address = address
  if (city !== undefined) result.city = city
  if (state !== undefined) result.state = state
  if (zipCode !== undefined) result.zipCode = zipCode
  if (meetingFormat !== undefined) result.meetingFormat = meetingFormat
  if (meetingFrequency !== undefined) result.meetingFrequency = meetingFrequency
  if (meetingLength !== undefined) result.meetingLength = meetingLength
  if (meetingType !== undefined) result.meetingType = meetingType
  if (averageAttendance !== undefined) result.averageAttendance = averageAttendance
  if (hasConferences !== undefined) result.hasConferences = hasConferences
  if (hasOutsideSpeakers !== undefined) result.hasOutsideSpeakers = hasOutsideSpeakers
  if (hasEducationTraining !== undefined) result.hasEducationTraining = hasEducationTraining
  if (annualPrice !== undefined) result.annualPrice = annualPrice
  if (monthlyPrice !== undefined) result.monthlyPrice = monthlyPrice
  if (contactEmail !== undefined) result.contactEmail = contactEmail
  if (contactPhone !== undefined) result.contactPhone = contactPhone
  if (website !== undefined) result.website = website

  return result as ProgramData
}

export class FirecrawlService {
  private client: Firecrawl

  constructor(apiKey: string) {
    this.client = new Firecrawl({ apiKey })
  }

  /**
   * Run an agent prompt to extract program data
   * The agent autonomously searches the web and returns structured data
   *
   * The SDK automatically handles:
   * - Submitting the agent request
   * - Polling for completion (every 2 seconds)
   * - Returning the final result when status is completed/failed/cancelled
   *
   * Note: No timeout is set - the SDK will poll until Firecrawl completes the job.
   * Firecrawl jobs have their own expiration time. If needed, jobs can be cancelled
   * using client.cancelAgent(jobId).
   */
  async runAgentPrompt(
    prompt: string,
    maxCredits?: number,
  ): Promise<Array<ProgramData & { citations: string[] }>> {
    console.log('DEBUG: Running agent prompt with SDK (no timeout)...')

    // Define the schema for the agent to return
    const responseSchema = z.object({
      programs: z.array(ProgramSchema.passthrough()), // Allow citation fields to pass through
    })

    const result = await this.client.agent({
      prompt,
      schema: responseSchema as any, // SDK uses its own bundled Zod types; cast needed for version mismatch
      pollInterval: 2, // Poll every 2 seconds
      // No timeout - let Firecrawl complete the job naturally
      ...(maxCredits && { maxCredits }),
    })

    console.log('DEBUG: Firecrawl agent raw response:', JSON.stringify(result, null, 2))

    if (!result.success) {
      console.error('ERROR: Firecrawl agent request failed. Full result:', JSON.stringify(result, null, 2))
      throw new Error('Firecrawl agent request failed')
    }

    // This shouldn't happen since we poll indefinitely, but check anyway
    if (result.status === 'processing') {
      console.error('ERROR: Agent job still processing. Result:', JSON.stringify(result, null, 2))
      throw new Error('Agent job returned with processing status unexpectedly. Check your Firecrawl dashboard.')
    }

    if (result.status === 'failed') {
      console.error('ERROR: Agent job failed. Result:', JSON.stringify(result, null, 2))
      throw new Error(`Agent job failed: ${result.error || 'Unknown error'}`)
    }

    if (!result.data) {
      console.error('ERROR: No data in result. Full result:', JSON.stringify(result, null, 2))
      throw new Error('No data returned from agent')
    }

    // Log the actual data structure to debug
    console.log('DEBUG: Agent data type:', typeof result.data)
    console.log('DEBUG: Agent data is array?:', Array.isArray(result.data))
    console.log('DEBUG: Agent data constructor:', result.data?.constructor?.name)
    console.log('DEBUG: Agent data keys:', Object.keys(result.data as any))
    console.log('DEBUG: Agent data:', JSON.stringify(result.data, null, 2))

    // Parse the data - find the programs array regardless of what key the agent used.
    // The agent is AI-powered and may use semantic synonyms (e.g. 'groups', 'organizations')
    // instead of the schema key name 'programs'.
    const data = result.data as Record<string, any>

    const PROGRAM_ARRAY_KEYS = ['programs', 'groups', 'organizations', 'results', 'data', 'items']

    let rawPrograms: Array<Record<string, any>> | undefined

    // Try known keys in preference order first
    for (const key of PROGRAM_ARRAY_KEYS) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        if (key !== 'programs') {
          console.log(`DEBUG: Schema key 'programs' not found, using '${key}' instead`)
        }
        rawPrograms = data[key]
        break
      }
    }

    // Fall back to any array with content
    if (!rawPrograms) {
      const fallbackKey = Object.keys(data).find((key) => Array.isArray(data[key]) && data[key].length > 0)
      if (fallbackKey) {
        console.log(`DEBUG: Using fallback key '${fallbackKey}' for programs array`)
        rawPrograms = data[fallbackKey]
      }
    }

    if (!rawPrograms || !Array.isArray(rawPrograms)) {
      console.error('ERROR: No programs array found in agent response. Keys:', Object.keys(data))
      const dataPreview = JSON.stringify(data).substring(0, 1000)
      throw new Error(`No programs data returned from agent. Keys: [${Object.keys(data).join(', ')}]. Data: ${dataPreview}`)
    }

    // Normalize each program to our flat schema before returning
    return rawPrograms.map((program) => ({
      ...normalizeAgentData(program),
      citations: extractCitations(program),
    }))
  }
}

/**
 * Get a Firecrawl service instance
 */
export function getFirecrawlService(apiKey?: string): FirecrawlService {
  const key = apiKey || process.env.FIRECRAWL_API_KEY

  if (!key) {
    throw new Error('FIRECRAWL_API_KEY is not configured')
  }

  return new FirecrawlService(key)
}
