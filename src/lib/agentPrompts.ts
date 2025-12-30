/**
 * Agent Prompt utility for running Firecrawl agent prompts and saving programs
 */

import { getPayload } from 'payload'
import config from '@/payload.config'
import { getFirecrawlService, type ProgramData } from './firecrawl'

export interface RunAgentPromptResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ name?: string; error: string }>
}

/**
 * Convert a plain text description to Payload richText format
 */
function convertToRichText(description?: string) {
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
 * Run an agent prompt and save the resulting programs to the database
 *
 * @param promptId - The ID of the agent prompt to run
 * @returns Statistics about the programs created/updated
 */
export async function runAgentPrompt(promptId: number): Promise<RunAgentPromptResult> {
  const payload = await getPayload({ config })

  // Fetch the prompt
  const prompt = await payload.findByID({
    collection: 'agent-prompts',
    id: promptId,
  })

  if (!prompt) {
    throw new Error(`Agent prompt with ID ${promptId} not found`)
  }

  // Set status to processing
  await payload.update({
    collection: 'agent-prompts',
    id: promptId,
    data: { status: 'processing' },
  })

  console.log(`Running agent prompt: "${prompt.title}"`)

  const stats: RunAgentPromptResult = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
  }

  try {
    // Call Firecrawl agent with the prompt
    const firecrawl = getFirecrawlService()
    const programs = await firecrawl.runAgentPrompt(prompt.prompt, prompt.maxCredits || undefined)

    stats.total = programs.length
    console.log(`Agent returned ${programs.length} programs`)

    // Process each program
    for (const programData of programs) {
      try {
        // Check if program already exists (by name + city + state)
        const existing = await payload.find({
          collection: 'programs',
          where: {
            and: [
              { name: { equals: programData.name } },
              { city: { equals: programData.city } },
              { state: { equals: programData.state } },
            ],
          },
          limit: 1,
        })

        // Prepare the data
        const dataToSave = {
          ...programData,
          description: convertToRichText(programData.description),
          sourceUrl: JSON.stringify(programData.citations), // Store citations as JSON array
        }

        // Remove the citations field (not part of Programs schema)
        delete (dataToSave as any).citations

        if (existing.docs.length > 0) {
          // Update existing program
          await payload.update({
            collection: 'programs',
            id: existing.docs[0].id,
            data: dataToSave,
          })
          stats.updated++
          console.log(`✓ Updated: ${programData.name}`)
        } else {
          // Create new program as draft
          await payload.create({
            collection: 'programs',
            draft: true,
            data: dataToSave,
          })
          stats.created++
          console.log(`✓ Created: ${programData.name}`)
        }
      } catch (error) {
        stats.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        stats.errors.push({
          name: programData.name,
          error: errorMessage,
        })
        console.error(`✗ Failed to save ${programData.name}:`, errorMessage)
      }
    }

    console.log('Agent prompt run complete:', {
      total: stats.total,
      created: stats.created,
      updated: stats.updated,
      failed: stats.failed,
    })

    // On success, set status back to active and save results
    await payload.update({
      collection: 'agent-prompts',
      id: promptId,
      data: {
        status: 'active',
        lastRun: {
          timestamp: new Date().toISOString(),
          total: stats.total,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed,
          errors: stats.errors.length > 0 ? stats.errors : undefined,
        },
      },
    })

    return stats
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Agent prompt run failed:', errorMessage)

    // On error, set status to errored and save error state
    await payload.update({
      collection: 'agent-prompts',
      id: promptId,
      data: {
        status: 'errored',
        lastRun: {
          timestamp: new Date().toISOString(),
          total: stats.total,
          created: stats.created,
          updated: stats.updated,
          failed: stats.failed + 1,
          errors: [
            ...stats.errors,
            { error: errorMessage },
          ],
        },
      },
    })

    throw new Error(`Failed to run agent prompt: ${errorMessage}`)
  }
}
