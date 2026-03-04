/**
 * Agent Prompt utility for running Firecrawl agent prompts and saving programs
 */

import type { BasePayload } from 'payload'
import { getFirecrawlService, type ProgramData } from './firecrawl'
import { convertToRichText } from './programImport'

export interface RunAgentPromptResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ name?: string; error: string }>
  skippedPrograms?: Array<ProgramData & { skipReason: string; citations: string[] }>
}

/**
 * Run an agent prompt and save the resulting programs to the database
 *
 * @param promptId - The ID of the agent prompt to run
 * @param payload - The Payload instance from the current request context
 * @returns Statistics about the programs created/updated
 */
export async function runAgentPrompt(promptId: number, payload: BasePayload): Promise<RunAgentPromptResult> {
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
    skippedPrograms: [],
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

        // Remove fields that shouldn't be saved directly
        delete (dataToSave as any).citations // Not part of Programs schema
        delete (dataToSave as any).coordinates // Will be geocoded server-side by Payload

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

        stats.skippedPrograms!.push({
          ...programData,
          skipReason: errorMessage,
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
          skippedPrograms: stats.skippedPrograms && stats.skippedPrograms.length > 0 ? stats.skippedPrograms : undefined,
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
          skippedPrograms: stats.skippedPrograms && stats.skippedPrograms.length > 0 ? stats.skippedPrograms : undefined,
        },
      },
    })

    throw new Error(`Failed to run agent prompt: ${errorMessage}`)
  }
}
