import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/scrape/[jobId]
 * Get the status and progress of a scrape job
 *
 * Returns:
 * - jobId: string
 * - status: 'queued' | 'processing' | 'completed' | 'failed'
 * - totalUrls: number
 * - processedUrls: number
 * - successfulUrls: number
 * - failedUrls: number
 * - urls: Array of URL details with status and results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Fetch the job
    const job = await payload.findByID({
      collection: 'scrape-jobs',
      id: jobId,
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Calculate progress percentage
    const progress = job.totalUrls > 0
      ? Math.round((job.processedUrls / job.totalUrls) * 100)
      : 0

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      jobType: job.jobType,
      crawlUrl: job.crawlUrl,
      totalUrls: job.totalUrls,
      processedUrls: job.processedUrls,
      successfulUrls: job.successfulUrls,
      failedUrls: job.failedUrls,
      progress,
      urls: job.urls || [],
      errorLog: job.errorLog,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching scrape job:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch scrape job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
