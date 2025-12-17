import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * POST /api/scrape/batch
 * Submit a batch of URLs or a crawl URL for scraping
 *
 * Body:
 * - urls: string[] - List of URLs to scrape (extract mode)
 * - crawlUrl: string - Base URL to crawl (crawl mode)
 *
 * Returns:
 * - jobId: string - ID of the created scrape job
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { urls?: string[], crawlUrl?: string }
    const { urls, crawlUrl } = body

    // Validate input
    if (!urls && !crawlUrl) {
      return NextResponse.json(
        { error: 'Either urls or crawlUrl must be provided' },
        { status: 400 }
      )
    }

    if (urls && !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'urls must be an array' },
        { status: 400 }
      )
    }

    if (urls && urls.length === 0) {
      return NextResponse.json(
        { error: 'urls array cannot be empty' },
        { status: 400 }
      )
    }

    // Determine job type
    const jobType = crawlUrl ? 'crawl' : 'extract'

    // Get Payload instance
    const payload = await getPayload({ config })

    // Create scrape job
    const job = await payload.create({
      collection: 'scrape-jobs',
      data: {
        status: 'queued',
        jobType,
        urls: urls
          ? urls.map((url: string) => ({
              url,
              status: 'pending',
            }))
          : [],
        crawlUrl: crawlUrl || null,
        totalUrls: urls ? urls.length : 0,
        processedUrls: 0,
        successfulUrls: 0,
        failedUrls: 0,
      },
    })

    // Get Cloudflare context for queue access
    const { env } = await getCloudflareContext({ async: true })

    // Queue messages for each URL in extract mode
    if (jobType === 'extract' && urls) {
      for (const url of urls) {
        await env.SCRAPE_QUEUE.send({
          jobId: job.id,
          url,
          jobType: 'extract',
        })
      }
    } else if (jobType === 'crawl') {
      // Queue a single crawl job
      await env.SCRAPE_QUEUE.send({
        jobId: job.id,
        crawlUrl,
        jobType: 'crawl',
      })
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      totalUrls: job.totalUrls,
    })
  } catch (error) {
    console.error('Error creating scrape job:', error)
    return NextResponse.json(
      {
        error: 'Failed to create scrape job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
