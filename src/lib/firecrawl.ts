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
  meetingFrequency: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
  meetingLength: z.enum(['1-2', '2-4', '4-8']).optional(),
  meetingType: z.enum(['peer-group', 'forum', 'small-group']).optional(),
  averageAttendance: z.enum(['1-10', '10-20', '20-50', '50-100', '100+']).optional(),
  hasConferences: z.enum(['none', 'annual', 'multiple']).optional(),
  hasOutsideSpeakers: z.boolean().optional(),
  hasEducationTraining: z.boolean().optional(),
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
      throw new Error('Firecrawl agent request failed')
    }

    // This shouldn't happen since we poll indefinitely, but check anyway
    if (result.status === 'processing') {
      throw new Error('Agent job returned with processing status unexpectedly. Check your Firecrawl dashboard.')
    }

    if (result.status === 'failed') {
      throw new Error(`Agent job failed: ${result.error || 'Unknown error'}`)
    }

    if (!result.data) {
      throw new Error('No data returned from agent')
    }

    // Log the actual data structure to debug
    console.log('DEBUG: Agent data keys:', Object.keys(result.data as any))
    console.log('DEBUG: Agent data:', JSON.stringify(result.data, null, 2))

    // Parse the data - it should match our schema
    const data = result.data as { programs?: Array<ProgramData & Record<string, any>> }

    if (!data.programs || !Array.isArray(data.programs)) {
      console.error('ERROR: Expected data.programs array, got:', typeof data.programs)
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
