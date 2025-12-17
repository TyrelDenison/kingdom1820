import { CollectionConfig } from 'payload'

export const ScrapeJobs: CollectionConfig = {
  slug: 'scrape-jobs',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'status', 'totalUrls', 'processedUrls', 'createdAt'],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'queued',
      index: true,
    },
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: [
        { label: 'Extract URLs', value: 'extract' },
        { label: 'Crawl Domain', value: 'crawl' },
      ],
      defaultValue: 'extract',
    },
    {
      name: 'urls',
      type: 'array',
      admin: {
        description: 'URLs to scrape (for extract mode)',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Success', value: 'success' },
            { label: 'Failed', value: 'failed' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'programId',
          type: 'relationship',
          relationTo: 'programs',
        },
        {
          name: 'error',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'crawlUrl',
      type: 'text',
      admin: {
        description: 'Base URL to crawl (for crawl mode)',
      },
    },
    {
      name: 'totalUrls',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'processedUrls',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'successfulUrls',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'failedUrls',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'errorLog',
      type: 'textarea',
      admin: {
        description: 'General error messages for the job',
      },
    },
  ],
  timestamps: true,
}
