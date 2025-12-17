/**
 * Cloudflare Cron Handler
 * Processes queued scraping jobs based on admin-configured settings
 */

interface CloudflareEnv {
  D1: D1Database
  R2: R2Bucket
  SCRAPE_QUEUE: Queue
  FIRECRAWL_API_KEY: string
  PAYLOAD_SECRET: string
}

/**
 * Process pending scraping jobs
 */
export async function processPendingJobs(env: CloudflareEnv): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const config = await import('./payload.config')
    const { getFirecrawlService } = await import('./lib/firecrawl')

    const payload = await getPayload({ config: config.default })

    // Get scraper settings
    const settings = await payload.findGlobal({
      slug: 'scraper-settings',
    })

    // Check if processing is enabled
    if (!settings.enabled) {
      console.log('Automatic processing is disabled')
      return
    }

    // Check if enough time has passed since last run
    const frequencyMinutes = parseInt(settings.frequency || '5')
    const now = new Date()
    const lastRun = settings.lastRun ? new Date(settings.lastRun) : new Date(0)
    const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / 1000 / 60

    if (minutesSinceLastRun < frequencyMinutes) {
      console.log(
        `Skipping - only ${minutesSinceLastRun.toFixed(1)} minutes since last run (need ${frequencyMinutes})`
      )
      return
    }

    console.log('Processing queued jobs...')

    // Find jobs with pending URLs
    const jobs = await payload.find({
      collection: 'scrape-jobs',
      where: {
        status: {
          in: ['queued', 'processing'],
        },
      },
      limit: settings.maxConcurrent || 3,
    })

    if (!jobs.docs || jobs.docs.length === 0) {
      console.log('No pending jobs to process')
      await payload.updateGlobal({
        slug: 'scraper-settings',
        data: {
          lastRun: now.toISOString(),
        },
      })
      return
    }

    const firecrawl = getFirecrawlService(env.FIRECRAWL_API_KEY)
    const batchSize = settings.batchSize || 5
    const delayMs = (settings.delayBetweenRequests || 2) * 1000

    let totalProcessed = 0
    let totalSuccessful = 0
    let totalFailed = 0

    // Process each job
    for (const job of jobs.docs) {
      // Update job status to processing
      if (job.status === 'queued') {
        await payload.update({
          collection: 'scrape-jobs',
          id: job.id,
          data: { status: 'processing' },
        })
      }

      // Find pending URLs in this job
      const pendingUrls = (job.urls || [])
        .filter((u: any) => u.status === 'pending')
        .slice(0, batchSize)

      if (pendingUrls.length === 0) {
        // Mark job as completed
        await payload.update({
          collection: 'scrape-jobs',
          id: job.id,
          data: { status: 'completed' },
        })
        continue
      }

      console.log(`Processing ${pendingUrls.length} URLs for job ${job.id}`)

      // Process each URL
      for (const urlEntry of pendingUrls) {
        try {
          totalProcessed++

          // Extract program data
          const programData = await firecrawl.extractProgram(urlEntry.url)

          // Convert description string to richText format if present
          const description = programData.description ? {
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
                      text: programData.description,
                      version: 1,
                    },
                  ],
                  direction: 'ltr' as const,
                },
              ],
              direction: 'ltr' as const,
            },
          } : undefined

          // Save as draft program
          const program = await payload.create({
            collection: 'programs',
            draft: true,
            data: {
              ...programData,
              description,
              sourceUrl: urlEntry.url,
            },
          })

          // Update URL status
          const updatedUrls = (job.urls || []).map((u: any) =>
            u.url === urlEntry.url
              ? { ...u, status: 'success', programId: program.id }
              : u
          )

          await payload.update({
            collection: 'scrape-jobs',
            id: job.id,
            data: {
              urls: updatedUrls,
              processedUrls: job.processedUrls + 1,
              successfulUrls: job.successfulUrls + 1,
            },
          })

          totalSuccessful++
          console.log(`✓ Successfully processed ${urlEntry.url}`)

          // Delay between requests
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }
        } catch (error) {
          totalFailed++
          console.error(`✗ Failed to process ${urlEntry.url}:`, error)

          // Update URL status with error
          const updatedUrls = (job.urls || []).map((u: any) =>
            u.url === urlEntry.url
              ? {
                  ...u,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              : u
          )

          await payload.update({
            collection: 'scrape-jobs',
            id: job.id,
            data: {
              urls: updatedUrls,
              processedUrls: job.processedUrls + 1,
              failedUrls: job.failedUrls + 1,
            },
          })
        }
      }

      // Check if job is complete
      const updatedJob = await payload.findByID({
        collection: 'scrape-jobs',
        id: job.id,
      })

      if (updatedJob.processedUrls >= updatedJob.totalUrls) {
        await payload.update({
          collection: 'scrape-jobs',
          id: job.id,
          data: { status: 'completed' },
        })
      }
    }

    // Update settings with statistics
    await payload.updateGlobal({
      slug: 'scraper-settings',
      data: {
        lastRun: now.toISOString(),
        totalProcessed: (settings.totalProcessed || 0) + totalProcessed,
        totalSuccessful: (settings.totalSuccessful || 0) + totalSuccessful,
        totalFailed: (settings.totalFailed || 0) + totalFailed,
      },
    })

    console.log(
      `Completed: ${totalProcessed} processed, ${totalSuccessful} successful, ${totalFailed} failed`
    )
  } catch (error) {
    console.error('Error in cron handler:', error)
    throw error
  }
}

// Export for Cloudflare Cron
export default {
  async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(processPendingJobs(env))
  },
}
