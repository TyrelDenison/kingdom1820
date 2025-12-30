/**
 * Firecrawl service for web scraping and data extraction using agent endpoint
 */

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
  coordinates: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
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
 * Agent response wrapper schema
 * The agent returns data in this format
 */
const AgentResponseSchema = z.object({
  programs: z.array(ProgramSchema.passthrough()), // Allow citation fields to pass through
})

export interface FirecrawlAgentResponse {
  success: boolean
  data: {
    programs: Array<ProgramData & Record<string, any>> // Allow citation fields
  }
  status?: 'processing' | 'completed' | 'failed'
  creditsUsed?: number
  expiresAt?: string
}

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
  private apiKey: string
  private baseUrl = 'https://api.firecrawl.dev/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Run an agent prompt to extract program data
   * The agent autonomously searches the web and returns structured data
   */
  async runAgentPrompt(
    prompt: string,
    maxCredits?: number,
  ): Promise<Array<ProgramData & { citations: string[] }>> {
    const response = await fetch(`${this.baseUrl}/agent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        schema: this.getProgramSchemaForFirecrawl(),
        ...(maxCredits && { maxCredits }),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Firecrawl API error: ${response.status} - ${error}`)
    }

    const result: any = await response.json()

    console.log('DEBUG: Firecrawl agent response:', {
      success: result.success,
      status: result.status,
      creditsUsed: result.creditsUsed,
      programCount: result.data?.programs?.length || 0,
    })

    if (!result.success) {
      throw new Error('Firecrawl agent request failed')
    }

    // If we got an ID, it's an async job - poll for results
    if (result.id && !result.data) {
      console.log('DEBUG: Agent job started, polling for results...')
      return await this.pollAgentJob(result.id)
    }

    // Validate and parse the response
    const validatedData = AgentResponseSchema.parse(result.data)

    // Extract citations for each program
    return validatedData.programs.map((program) => ({
      ...program,
      citations: extractCitations(program),
    }))
  }

  /**
   * Poll for agent job completion
   */
  private async pollAgentJob(
    jobId: string,
  ): Promise<Array<ProgramData & { citations: string[] }>> {
    let attempts = 0
    const maxAttempts = 60 // 60 attempts * 5 seconds = 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

      const response = await fetch(`${this.baseUrl}/agent/${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to check agent job status: ${response.status}`)
      }

      const status: any = await response.json()
      console.log(`DEBUG: Agent job status (attempt ${attempts + 1}):`, status.status || 'unknown')

      if (status.status === 'completed' && status.data) {
        // Validate and parse the response
        const validatedData = AgentResponseSchema.parse(status.data)

        // Extract citations for each program
        return validatedData.programs.map((program) => ({
          ...program,
          citations: extractCitations(program),
        }))
      }

      if (status.status === 'failed') {
        throw new Error('Agent job failed')
      }

      attempts++
    }

    throw new Error('Agent job timed out after 5 minutes')
  }

  /**
   * Convert Zod schema to Firecrawl-compatible JSON schema format
   */
  private getProgramSchemaForFirecrawl() {
    return {
      type: 'object',
      properties: {
        programs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              religiousAffiliation: {
                type: 'string',
                enum: ['protestant', 'catholic'],
              },
              address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              coordinates: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                },
              },
              meetingFormat: {
                type: 'string',
                enum: ['in-person', 'online', 'both'],
              },
              meetingFrequency: {
                type: 'string',
                enum: ['weekly', 'monthly', 'quarterly'],
              },
              meetingLength: {
                type: 'string',
                enum: ['1-2', '2-4', '4-8'],
              },
              meetingType: {
                type: 'string',
                enum: ['peer-group', 'forum', 'small-group'],
              },
              averageAttendance: {
                type: 'string',
                enum: ['1-10', '10-20', '20-50', '50-100', '100+'],
              },
              hasConferences: {
                type: 'string',
                enum: ['none', 'annual', 'multiple'],
              },
              hasOutsideSpeakers: { type: 'boolean' },
              hasEducationTraining: { type: 'boolean' },
              contactEmail: { type: 'string' },
              contactPhone: { type: 'string' },
              website: { type: 'string' },
            },
          },
        },
      },
    }
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
