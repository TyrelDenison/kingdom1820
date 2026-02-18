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
      schema: responseSchema as any, // Type assertion needed for Zod schema compatibility
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

    // Parse the data - it should match our schema
    const data = result.data as { programs?: Array<ProgramData & Record<string, any>> }

    console.log('DEBUG: data.programs exists?:', 'programs' in (result.data as any))
    console.log('DEBUG: data.programs type:', typeof data.programs)
    console.log('DEBUG: data.programs is array?:', Array.isArray(data.programs))
    console.log('DEBUG: data.programs length:', data.programs?.length)

    if (!data.programs || !Array.isArray(data.programs)) {
      console.error('ERROR: Expected data.programs array, got:', typeof data.programs)
      console.error('ERROR: Full data object:', JSON.stringify(data, null, 2))
      console.error('ERROR: All keys in data:', Object.keys(data))
      throw new Error('No programs data returned from agent')
    }

    // Extract citations for each program
    return data.programs.map((program) => ({
      ...program,
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
