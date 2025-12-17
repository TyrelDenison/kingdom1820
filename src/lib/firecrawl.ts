/**
 * Firecrawl service for web scraping and data extraction
 */

export interface ProgramSchema {
  name?: string
  description?: string
  religiousAffiliation?: 'protestant' | 'catholic'
  address?: string
  city?: string
  state?: string
  zipCode?: string
  coordinates?: {
    lat?: number
    lng?: number
  }
  meetingFormat?: 'in-person' | 'online' | 'both'
  meetingFrequency?: 'weekly' | 'monthly' | 'quarterly'
  meetingLength?: '1-2' | '2-4' | '4-8'
  meetingType?: 'peer-group' | 'forum' | 'small-group'
  averageAttendance?: '1-10' | '10-20' | '20-50' | '50-100' | '100+'
  hasConferences?: 'none' | 'annual' | 'multiple'
  hasOutsideSpeakers?: boolean
  hasEducationTraining?: boolean
  contactEmail?: string
  contactPhone?: string
  website?: string
}

const programSchema = {
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
}

export interface FirecrawlExtractResponse {
  success: boolean
  data: ProgramSchema
  status?: 'processing' | 'completed' | 'failed'
  expiresAt?: string
}

export interface FirecrawlCrawlResponse {
  success: boolean
  id: string
  url: string
}

export interface FirecrawlCrawlStatusResponse {
  success: boolean
  status: 'scraping' | 'completed' | 'failed'
  total: number
  completed: number
  creditsUsed: number
  expiresAt: string
  next?: string
  data: Array<{
    markdown: string
    html: string
    metadata: {
      title: string
      description: string
      language: string
      sourceURL: string
    }
  }>
}

export class FirecrawlService {
  private apiKey: string
  private baseUrl = 'https://api.firecrawl.dev/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Extract structured program data from a single URL
   */
  async extractProgram(url: string): Promise<ProgramSchema> {
    const response = await fetch(`${this.baseUrl}/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [url],
        schema: programSchema,
        prompt:
          'Extract information about this faith-based leadership program. Include all available details about meetings, location, format, and contact information.',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Firecrawl API error: ${response.status} - ${error}`)
    }

    const result: any = await response.json()

    // Debug logging
    console.log('DEBUG: Full API response:', JSON.stringify(result, null, 2))

    if (!result.success) {
      throw new Error('Firecrawl extraction failed')
    }

    // If we got an ID, it's an async job - poll for results
    if (result.id && !result.data) {
      console.log('DEBUG: Extract job started, polling for results...')
      return await this.pollExtractJob(result.id)
    }

    return result.data
  }

  /**
   * Poll for extract job completion
   */
  private async pollExtractJob(jobId: string): Promise<ProgramSchema> {
    let attempts = 0
    const maxAttempts = 30 // 30 attempts * 2 seconds = 1 minute max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

      const response = await fetch(`${this.baseUrl}/extract/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to check extract job status: ${response.status}`)
      }

      const status: any = await response.json()
      console.log(`DEBUG: Job status (attempt ${attempts + 1}):`, status.status || 'unknown')

      if (status.status === 'completed' && status.data) {
        return status.data
      }

      if (status.status === 'failed') {
        throw new Error('Extract job failed')
      }

      attempts++
    }

    throw new Error('Extract job timed out')
  }

  /**
   * Start a crawl job to discover program pages on a domain
   */
  async startCrawl(url: string, pattern?: string): Promise<string> {
    const crawlUrl = pattern ? `${url}${pattern}` : url

    const response = await fetch(`${this.baseUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: crawlUrl,
        limit: 100,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Firecrawl API error: ${response.status} - ${error}`)
    }

    const result: FirecrawlCrawlResponse = await response.json()

    if (!result.success) {
      throw new Error('Failed to start crawl job')
    }

    return result.id
  }

  /**
   * Check the status of a crawl job
   */
  async getCrawlStatus(jobId: string): Promise<FirecrawlCrawlStatusResponse> {
    const response = await fetch(`${this.baseUrl}/crawl/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Firecrawl API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  /**
   * Extract programs from multiple URLs in batch
   */
  async extractProgramsBatch(urls: string[]): Promise<Array<{ url: string; data: ProgramSchema; error?: string }>> {
    const results = []

    for (const url of urls) {
      try {
        const data = await this.extractProgram(url)
        results.push({ url, data })
      } catch (error) {
        results.push({
          url,
          data: {} as ProgramSchema,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
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
