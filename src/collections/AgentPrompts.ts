import { CollectionConfig } from 'payload'
import { runAgentPrompt } from '@/lib/agentPrompts'

export const AgentPrompts: CollectionConfig = {
  slug: 'agent-prompts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'actions', 'updatedAt'],
    description: 'Manage prompts for the Firecrawl agent endpoint',
    components: {
      edit: {
        beforeDocumentControls: ['src/components/admin/RunAgentPromptButton'],
      },
    },
  },
  endpoints: [
    {
      path: '/:id/execute',
      method: 'post',
      handler: async (req) => {
        try {
          const { id } = req.routeParams as { id?: string }

          if (!id) {
            return Response.json(
              { error: 'Invalid prompt ID' },
              { status: 400 }
            )
          }

          const promptId = parseInt(id, 10)

          if (isNaN(promptId)) {
            return Response.json(
              { error: 'Invalid prompt ID' },
              { status: 400 }
            )
          }

          // Verify prompt exists and is active
          const prompt = await req.payload.findByID({
            collection: 'agent-prompts',
            id: promptId,
          })

          if (!prompt) {
            return Response.json(
              { error: 'Prompt not found' },
              { status: 404 }
            )
          }

          if (prompt.status !== 'active') {
            return Response.json(
              { error: 'Only active prompts can be executed' },
              { status: 400 }
            )
          }

          // Execute the agent prompt
          const result = await runAgentPrompt(promptId)

          return Response.json(result)
        } catch (error) {
          console.error('Error executing agent prompt:', error)
          return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        }
      },
    },
  ],
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
        {
          label: 'Processing',
          value: 'processing',
        },
        {
          label: 'Errored',
          value: 'errored',
        },
      ],
      admin: {
        description: 'Processing state managed automatically during execution',
        position: 'sidebar',
      },
    },
    {
      name: 'maxCredits',
      type: 'number',
      admin: {
        description: 'Maximum Firecrawl credits to spend on this agent run. Leave empty for no limit.',
        position: 'sidebar',
      },
      min: 0,
    },
    {
      name: 'actions',
      type: 'ui',
      admin: {
        components: {
          Cell: 'src/components/admin/AgentPromptActions',
        },
      },
    },
  ],
  timestamps: true, // This adds createdAt and updatedAt fields automatically
  versions: {
    drafts: true, // This enables version history for tracking changes
  },
}
