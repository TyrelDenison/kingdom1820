import { GlobalConfig } from 'payload'

export const ScraperSettings: GlobalConfig = {
  slug: 'scraper-settings',
  label: 'Scraper Settings',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Processing Frequency',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enable Automatic Processing',
              defaultValue: true,
              admin: {
                description: 'When enabled, queued scraping jobs will be processed automatically',
              },
            },
            {
              name: 'frequency',
              type: 'select',
              label: 'Processing Frequency',
              required: true,
              defaultValue: '5',
              options: [
                { label: 'Every minute', value: '1' },
                { label: 'Every 2 minutes', value: '2' },
                { label: 'Every 5 minutes', value: '5' },
                { label: 'Every 10 minutes', value: '10' },
                { label: 'Every 15 minutes', value: '15' },
                { label: 'Every 30 minutes', value: '30' },
                { label: 'Every hour', value: '60' },
              ],
              admin: {
                description: 'How often to check for and process queued jobs',
              },
            },
            {
              name: 'batchSize',
              type: 'number',
              label: 'Batch Size',
              required: true,
              defaultValue: 5,
              min: 1,
              max: 20,
              admin: {
                description: 'Number of URLs to process per batch (1-20)',
              },
            },
            {
              name: 'lastRun',
              type: 'date',
              label: 'Last Processing Run',
              admin: {
                readOnly: true,
                description: 'Last time the scraper processed jobs',
              },
            },
          ],
        },
        {
          label: 'Rate Limiting',
          fields: [
            {
              name: 'delayBetweenRequests',
              type: 'number',
              label: 'Delay Between Requests (seconds)',
              required: true,
              defaultValue: 2,
              min: 0,
              max: 60,
              admin: {
                description: 'Wait time between processing each URL (0-60 seconds)',
              },
            },
            {
              name: 'maxConcurrent',
              type: 'number',
              label: 'Max Concurrent Jobs',
              required: true,
              defaultValue: 3,
              min: 1,
              max: 10,
              admin: {
                description: 'Maximum number of scraping jobs to process simultaneously',
              },
            },
          ],
        },
        {
          label: 'Statistics',
          fields: [
            {
              name: 'totalProcessed',
              type: 'number',
              label: 'Total URLs Processed',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'totalSuccessful',
              type: 'number',
              label: 'Total Successful',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'totalFailed',
              type: 'number',
              label: 'Total Failed',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
}
