/**
 * Cloudflare Queue Consumer Handler
 * Processes scraping jobs from the queue
 */

import { getPayload } from 'payload'
import config from './payload.config'
import { getFirecrawlService, ProgramSchema } from './lib/firecrawl'

interface QueueMessage {
  jobId: string | number
  url?: string
  crawlUrl?: string
  jobType: 'extract' | 'crawl'
}

interface CloudflareEnv {
  D1: D1Database
  R2: R2Bucket
  SCRAPE_QUEUE: Queue
  FIRECRAWL_API_KEY: string
  PAYLOAD_SECRET: string
}

/**
 * Handle messages from the scrape queue
 */
export async function handleQueueMessage(
  batch: MessageBatch<QueueMessage>,
  env: CloudflareEnv
): Promise<void> {
  const firecrawl = getFirecrawlService(env.FIRECRAWL_API_KEY)

  for (const message of batch.messages) {
    const { jobId, url, crawlUrl, jobType } = message.body

    try {
      // Get Payload instance
      const payload = await getPayload({ config })

      // Fetch the job
      const job = await payload.findByID({
        collection: 'scrape-jobs',
        id: jobId,
      })

      if (!job) {
        console.error(`Job ${jobId} not found`)
        message.ack()
        continue
      }

      // Update job status to processing if not already
      if (job.status === 'queued') {
        await payload.update({
          collection: 'scrape-jobs',
          id: jobId,
          data: {
            status: 'processing',
          },
        })
      }

      if (jobType === 'extract' && url) {
        // Extract program data from URL
        await processExtractJob(payload, firecrawl, jobId, url, job)
      } else if (jobType === 'crawl' && crawlUrl) {
        // Start crawl and wait for results
        await processCrawlJob(payload, firecrawl, jobId, crawlUrl, job)
      }

      // Acknowledge message as processed
      message.ack()
    } catch (error) {
      console.error(`Error processing message for job ${jobId}:`, error)

      // Retry the message (it will be requeued automatically)
      message.retry()
    }
  }
}

/**
 * Process a single URL extraction
 */
async function processExtractJob(
  payload: any,
  firecrawl: any,
  jobId: string | number,
  url: string,
  job: any
): Promise<void> {
  try {
    // Extract program data
    const programData = await firecrawl.extractProgram(url)

    // Save as draft program
    const program = await payload.create({
      collection: 'programs',
      data: {
        ...programData,
        sourceUrl: url,
        _status: 'draft',
      },
    })

    // Update job with success
    const urlIndex = job.urls?.findIndex((u: any) => u.url === url) ?? -1

    if (urlIndex !== -1 && job.urls) {
      job.urls[urlIndex].status = 'success'
      job.urls[urlIndex].programId = program.id
    }

    await payload.update({
      collection: 'scrape-jobs',
      id: jobId,
      data: {
        urls: job.urls,
        processedUrls: job.processedUrls + 1,
        successfulUrls: job.successfulUrls + 1,
        status: job.processedUrls + 1 >= job.totalUrls ? 'completed' : 'processing',
      },
    })

    console.log(`Successfully processed ${url} for job ${jobId}`)
  } catch (error) {
    console.error(`Error extracting program from ${url}:`, error)

    // Update job with failure
    const urlIndex = job.urls?.findIndex((u: any) => u.url === url) ?? -1

    if (urlIndex !== -1 && job.urls) {
      job.urls[urlIndex].status = 'failed'
      job.urls[urlIndex].error = error instanceof Error ? error.message : 'Unknown error'
    }

    await payload.update({
      collection: 'scrape-jobs',
      id: jobId,
      data: {
        urls: job.urls,
        processedUrls: job.processedUrls + 1,
        failedUrls: job.failedUrls + 1,
        status: job.processedUrls + 1 >= job.totalUrls ? 'completed' : 'processing',
      },
    })
  }
}

/**
 * Process a crawl job
 */
async function processCrawlJob(
  payload: any,
  firecrawl: any,
  jobId: string | number,
  crawlUrl: string,
  job: any
): Promise<void> {
  try {
    // Start the crawl
    const crawlJobId = await firecrawl.startCrawl(crawlUrl)

    // Poll for crawl completion
    let crawlStatus = await firecrawl.getCrawlStatus(crawlJobId)

    while (crawlStatus.status === 'scraping') {
      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000))
      crawlStatus = await firecrawl.getCrawlStatus(crawlJobId)
    }

    if (crawlStatus.status === 'failed') {
      throw new Error('Crawl job failed')
    }

    // Extract data from all discovered pages
    const urls = crawlStatus.data.map((page: any) => page.metadata.sourceURL)

    // Update job with discovered URLs
    await payload.update({
      collection: 'scrape-jobs',
      id: jobId,
      data: {
        urls: urls.map((url: string) => ({
          url,
          status: 'pending',
        })),
        totalUrls: urls.length,
      },
    })

    // Queue extraction jobs for each URL
    // Note: This would need access to the SCRAPE_QUEUE binding
    // For now, we'll process them sequentially
    for (const url of urls) {
      await processExtractJob(payload, firecrawl, jobId, url, {
        ...job,
        urls: job.urls || [],
      })
    }

    await payload.update({
      collection: 'scrape-jobs',
      id: jobId,
      data: {
        status: 'completed',
      },
    })

    console.log(`Successfully completed crawl job ${jobId}`)
  } catch (error) {
    console.error(`Error processing crawl job ${jobId}:`, error)

    await payload.update({
      collection: 'scrape-jobs',
      id: jobId,
      data: {
        status: 'failed',
        errorLog: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}

// Export for Cloudflare Workers Queue consumer
export default {
  async queue(batch: MessageBatch<QueueMessage>, env: CloudflareEnv): Promise<void> {
    await handleQueueMessage(batch, env)
  },
}
