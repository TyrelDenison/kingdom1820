/**
 * Simple Cloudflare Cron Handler
 * Calls the main app's processing endpoint
 */

interface CloudflareEnv {
  WORKER_URL?: string
  CRON_SECRET?: string
}

export default {
  async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
    const workerUrl = env.WORKER_URL || 'https://kingdom1820.tyrel-06a.workers.dev'

    console.log('Cron triggered, calling processing endpoint...')

    ctx.waitUntil(
      fetch(`${workerUrl}/api/scrape/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cron-Secret': env.CRON_SECRET || 'internal-cron',
        },
      })
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            console.log('Processing completed:', data)
          } else {
            console.error('Processing failed:', response.status, await response.text())
          }
        })
        .catch((error) => {
          console.error('Error calling processing endpoint:', error)
        })
    )
  },
}
