import { CollectionConfig } from 'payload'

export const AgentPrompts: CollectionConfig = {
  slug: 'agent-prompts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
    description: 'Manage prompts for the Firecrawl agent endpoint',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'A descriptive title for this agent prompt',
      },
    },
    {
      name: 'prompt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The prompt text to send to the Firecrawl agent',
        rows: 10,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Active',
          value: 'active',
        },
      ],
      admin: {
        description: 'Set to Active to use this prompt in production',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true, // This adds createdAt and updatedAt fields automatically
  versions: {
    drafts: true, // This enables version history for tracking changes
  },
}
