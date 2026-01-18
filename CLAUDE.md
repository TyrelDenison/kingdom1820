# Claude Code Reference - Kingdom1820

This document provides technical context for AI assistants working on the Kingdom1820 codebase.

## Project Overview

Kingdom1820 is a Next.js 15 application with Payload CMS 3.63, deployed on Cloudflare Workers. It provides a searchable directory of Christian business peer advisory groups with AI-powered data extraction via Firecrawl.

**Key Technologies:**
- Next.js 15 (App Router)
- Payload CMS 3.63
- Cloudflare D1 (SQLite database)
- Cloudflare R2 (object storage)
- Firecrawl SDK (@mendable/firecrawl-js v4.10.0)
- Zod (schema validation)
- TypeScript

## Architecture

### Data Flow

1. **Data Extraction (AI-Powered)**
   - Admin creates an `AgentPrompt` in Payload CMS
   - `runAgentPrompt(promptId)` executes the prompt via Firecrawl agent
   - Agent autonomously searches web and returns structured JSON
   - Data is validated against Zod schema
   - Programs saved/updated in database with citations

2. **Public Interface**
   - Next.js Server Components fetch from Payload API
   - Client components handle filtering and interactivity
   - Programs displayed in searchable grid with filters

### Directory Structure

```
src/
├── app/
│   ├── (frontend)/              # Public pages
│   │   ├── page.tsx             # Home page with hero and featured programs
│   │   ├── programs/
│   │   │   ├── page.tsx         # Search/browse with filters (Server Component)
│   │   │   ├── ProgramsClient.tsx  # Client-side filtering logic
│   │   │   └── [id]/page.tsx    # Program detail page
│   │   ├── components/
│   │   │   ├── Header.tsx       # Site-wide navigation
│   │   │   └── ProgramCard.tsx  # Reusable program card
│   │   └── styles.css           # Global styles (indigo theme)
│   ├── (payload)/               # Payload admin routes (Next.js route group)
│   │   └── admin/
│   │       └── importMap.js     # Auto-generated component map
│   └── api/                     # Reserved for future API routes
├── collections/
│   ├── Programs.ts              # Main program data collection
│   ├── AgentPrompts.ts          # AI extraction prompts collection
│   ├── Users.ts                 # Admin authentication
│   └── Media.ts                 # R2 file uploads
├── components/
│   └── admin/                   # Payload admin UI components
│       ├── RunAgentPromptButton.tsx  # Edit view execution button
│       ├── AgentPromptActions.tsx    # List view actions column
│       ├── LastRunDisplay.tsx        # Edit view last run details
│       └── LastRunCell.tsx           # List view last run cell
├── globals/                     # (Empty - ScraperSettings removed)
├── lib/
│   ├── firecrawl.ts             # Firecrawl service + Zod schemas
│   └── agentPrompts.ts          # Agent prompt execution utility
├── migrations/                  # Database migration files
└── payload.config.ts            # Payload CMS configuration
```

## Collections Reference

### Programs Collection (`src/collections/Programs.ts`)

The core data model for faith-based programs.

**Schema:**
```typescript
{
  name: string (required)
  description: richText (Lexical editor)
  relatedPrograms: relationship[] (self-referential)
  religiousAffiliation: 'protestant' | 'catholic' (required, indexed)
  address: string (required)
  city: string (required, indexed)
  state: string (required, 2-letter code, indexed)
  zipCode: string (required, validated)
  coordinates: { lat: number, lng: number }
  meetingFormat: 'in-person' | 'online' | 'both' (required, indexed)
  meetingFrequency: 'weekly' | 'monthly' | 'quarterly' (required, indexed)
  meetingLength: '1-2' | '2-4' | '4-8' (required, indexed)
  meetingType: 'peer-group' | 'forum' | 'small-group' (required, indexed)
  averageAttendance: '1-10' | '10-20' | '20-50' | '50-100' | '100+' (required, indexed)
  hasConferences: 'none' | 'annual' | 'multiple' (indexed)
  hasOutsideSpeakers: boolean (indexed)
  hasEducationTraining: boolean (indexed)
  annualPrice: number (default: 0, validated ≥ 0)
  monthlyPrice: number (default: 0, validated ≥ 0)
  annualPriceRange: '0-240' | '241-600' | '601-2400' | '2401-8400' | '8401+' (read-only, auto-calculated, indexed)
  monthlyPriceRange: '0-20' | '21-50' | '51-200' | '201-700' | '701+' (read-only, auto-calculated, indexed)
  contactEmail: email
  contactPhone: string
  website: string
  sourceUrl: string (read-only, stores citations as JSON array)
}
```

**Important Notes:**
- `sourceUrl` stores citations as JSON array string: `["url1", "url2"]`
- Drafts enabled with `versions: { drafts: true }`
- Multiple fields indexed for faceted search/filtering
- Price ranges are automatically calculated via `beforeChange` hook when `annualPrice` or `monthlyPrice` are set
- Programs can have annual pricing, monthly pricing, or both

### AgentPrompts Collection (`src/collections/AgentPrompts.ts`)

Manages natural language prompts for the Firecrawl AI agent.

**Schema:**
```typescript
{
  title: string (required)
  prompt: textarea (required, 10+ rows)
  status: 'draft' | 'active' | 'processing' | 'errored' (required, default: 'draft')
  maxCredits: number (optional, min: 0)
  lastRun: json (auto, read-only)
  createdAt: timestamp (auto)
  updatedAt: timestamp (auto)
}
```

**Status Field:**
- `draft` - Initial state for testing prompts
- `active` - Ready for execution (only this status can be run)
- `processing` - Currently executing (set automatically during run)
- `errored` - Last execution failed (requires manual reset to active)

**LastRun Field:**
Automatically populated after each execution with:
```typescript
{
  timestamp: string (ISO 8601)
  total: number
  created: number
  updated: number
  failed: number
  errors?: Array<{ name?: string; error: string }>
}
```

**Important Notes:**
- Only 'active' prompts can be executed via UI or API
- `maxCredits` controls Firecrawl spending limit (null = no limit)
- Version history enabled for tracking prompt iterations
- `lastRun` provides full execution history with error details

### Users Collection (`src/collections/Users.ts`)

Standard Payload auth collection for admin access.

### Media Collection (`src/collections/Media.ts`)

R2-backed file uploads with required alt text.

## Data Extraction System

### Firecrawl Service (`src/lib/firecrawl.ts`)

**Key Exports:**

```typescript
// Zod schema matching Programs collection (excluding coordinates)
export const ProgramSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  religiousAffiliation: z.enum(['protestant', 'catholic']).optional(),
  // ... 20 program fields (coordinates excluded - will be geocoded server-side)
})

export type ProgramData = z.infer<typeof ProgramSchema>

// Extract citations from agent response
export function extractCitations(obj: any): string[]

// Firecrawl service class
export class FirecrawlService {
  async runAgentPrompt(
    prompt: string,
    maxCredits?: number
  ): Promise<Array<ProgramData & { citations: string[] }>>
}

export function getFirecrawlService(apiKey?: string): FirecrawlService
```

**How runAgentPrompt Works:**

1. Uses Firecrawl SDK's `.agent()` method with prompt and schema
2. SDK automatically submits request and polls for completion (every 2 seconds)
3. Agent autonomously searches web based on natural language prompt
4. Returns JSON matching schema with citation fields (e.g., `name_citation`, `address_citation`)
5. Validates response with Zod schema
6. Extracts all `*_citation` fields recursively
7. Returns programs with parsed citations array

**Note:** The SDK polls indefinitely until Firecrawl completes the job (no timeout). Jobs have their own expiration time managed by Firecrawl.

**Response Format:**

The agent returns:
```json
{
  "programs": [
    {
      "name": "C12 Business Forums - Charleston, SC",
      "name_citation": "https://www.c12gaandsc.com/...",
      "address": "600 Island Park Drive, Charleston, SC 29492",
      "address_citation": "https://www.c12gaandsc.com/...",
      // ... more fields with citations
    }
  ]
}
```

### Agent Prompt Utility (`src/lib/agentPrompts.ts`)

**Key Export:**

```typescript
export async function runAgentPrompt(
  promptId: number
): Promise<RunAgentPromptResult>

interface RunAgentPromptResult {
  total: number      // Programs returned by agent
  created: number    // New programs created
  updated: number    // Existing programs updated
  failed: number     // Failed saves
  errors: Array<{ name?: string; error: string }>
}
```

**Execution Flow:**

1. Fetch AgentPrompt by ID from database
2. Call `firecrawl.runAgentPrompt(prompt.prompt, prompt.maxCredits)`
3. For each program returned:
   - Check for duplicate by `name + city + state`
   - Convert `description` string to Lexical richText format
   - Store citations as JSON array in `sourceUrl`
   - Filter out `citations` and `coordinates` fields (not part of Programs schema)
   - If exists: Update (both draft and published)
   - If new: Create as draft
4. Return detailed statistics

**Note:** Coordinates are excluded from the agent request and filtered before saving. They will be geocoded server-side from the address in a future implementation.

**Duplicate Detection:**

Programs are considered duplicates if they match on:
- `name` (exact match)
- `city` (exact match)
- `state` (exact match)

All duplicates are updated, regardless of draft/published status.

**Citation Storage:**

```typescript
// Citations extracted from agent response
const citations = extractCitations(rawProgramData)
// Example: ["https://site1.com", "https://site2.com"]

// Stored as JSON string
sourceUrl: JSON.stringify(citations)
```

**RichText Conversion:**

```typescript
function convertToRichText(description?: string) {
  return {
    root: {
      type: 'root',
      children: [{
        type: 'paragraph',
        children: [{
          type: 'text',
          text: description,
          // ... Lexical format properties
        }]
      }]
    }
  }
}
```

## Frontend Implementation

### Design System

**Color Scheme:**
- Primary: `#560591` (Indigo)
- Primary Dark: `#400069`
- Primary Light: `#7007b8`
- Accent: `#dc2626` (Red)

**Typography:**
- System font stack with fallbacks
- Semantic heading hierarchy (h1-h6)

### Components

**ProgramCard** (`src/app/(frontend)/components/ProgramCard.tsx`)
- Props: `program`, `variant` ('default' | 'compact')
- Displays program info in card format
- Hover effects and responsive design

**Header** (`src/app/(frontend)/components/Header.tsx`)
- Site-wide navigation
- Sticky positioning
- Logo + menu + CTA button

### Pages

**Home** (`src/app/(frontend)/page.tsx`)
- Server Component
- Fetches featured programs from Payload
- Hero, stats, featured grid, CTA sections

**Programs Search** (`src/app/(frontend)/programs/page.tsx`)
- Server Component fetches all programs
- Passes to `ProgramsClient` for filtering
- Client-side filtering for instant UX
- Comprehensive faceted search with filters:
  - Text search (name, city, state)
  - State (dropdown)
  - Religious affiliation (Protestant/Catholic)
  - Meeting format (in-person/online/both)
  - Meeting frequency (weekly/monthly/quarterly)
  - Meeting length (1-2/2-4/4-8 hours)
  - Meeting type (peer-group/forum/small-group)
  - Average attendance (1-10/10-20/20-50/50-100/100+)
  - Conferences (none/annual/multiple)
  - Outside speakers (yes/no)
  - Education & training (yes/no)
  - Annual price range ($0-$240/$241-$600/$601-$2,400/$2,401-$8,400/$8,401+)
  - Monthly price range ($0-$20/$21-$50/$51-$200/$201-$700/$701+)
- Scrollable sidebar with sticky positioning
- Active filter count display and "Clear All" functionality

**Program Detail** (`src/app/(frontend)/programs/[id]/page.tsx`)
- Server Component with dynamic params
- Full program details with breadcrumb
- Contact sidebar with icons

## Database Migrations

**Current Migrations:**

1. `20251215_160811.ts` - Initial schema
2. `20251215_164007.ts` - Created scrape_jobs (removed)
3. `20251215_180619.ts` - Created scraper_settings (removed)
4. `20251217_145316.ts` - Seed 50 mock programs
5. `20251229_224933.ts` - Added agent_prompts collection
6. `20251230_002230.ts` - Agent migration
   - Drops old scraping tables
   - Adds `max_credits` to agent_prompts
   - Seeds sample agent prompt
7. `20251230_173154.ts` - Agent status expansion
   - Adds 'processing' and 'errored' status options
   - Recreates agent_prompts table (SQLite limitation)
8. `20251230_194736.ts` - **Latest: Last run tracking**
   - Adds `last_run` JSON field to agent_prompts
   - Adds `version_last_run` to versions table

**Migration Workflow:**

```bash
# Make collection changes
# Then:
pnpm payload migrate:create  # Generate migration
pnpm payload migrate         # Run migration
pnpm run generate:types      # Update TypeScript types
```

## Environment Variables

**Required:**
- `PAYLOAD_SECRET` - Payload CMS secret key
- `FIRECRAWL_API_KEY` - Firecrawl API authentication

**Optional:**
- `CLOUDFLARE_ENV` - Environment identifier for deployments

**Local Development:**
- Wrangler automatically provides `cloudflare.env.D1` and `cloudflare.env.R2` bindings

## Common Tasks

### Adding a New Field to Programs

1. Update `src/collections/Programs.ts`:
   ```typescript
   {
     name: 'newField',
     type: 'text',
     required: false,
   }
   ```

2. Update Zod schema in `src/lib/firecrawl.ts`:
   ```typescript
   export const ProgramSchema = z.object({
     // ...
     newField: z.string().optional(),
   })
   ```

3. Generate migration:
   ```bash
   pnpm payload migrate:create
   ```

4. Update prompt to request new field

5. Regenerate types:
   ```bash
   pnpm run generate:types
   ```

**Note:** The Firecrawl SDK uses the Zod schema directly, so no separate JSON schema update is needed.

### Creating a New Agent Prompt

**Note:** Sample agent prompts are not seeded automatically during migrations. You must create them manually in the admin panel after deployment.

1. Go to `/admin/collections/agent-prompts`
2. Click "Create New"
3. Set:
   - **Title**: Descriptive name (e.g., "Top 100 Christian Business Groups")
   - **Prompt**: Natural language instructions with specific field requirements
   - **Status**: Draft (test first) or Active (production ready)
   - **Max Credits**: Optional spending limit

4. Example prompt structure:
   ```
   Extract data for the 100 largest [target organizations].

   For each program, extract ALL of the following fields:
   - name (required)
   - description
   - religiousAffiliation (protestant or catholic)
   - address, city, state, zipCode
   - meetingFormat, meetingFrequency, meetingLength, meetingType
   - averageAttendance, hasConferences, hasOutsideSpeakers, hasEducationTraining
   - annualPrice, monthlyPrice (membership fees in USD, use 0 if free or not available)
   - contactEmail, contactPhone, website

   Return data matching the provided JSON schema. Include source citations.
   ```

5. Test execution:
   ```typescript
   const result = await runAgentPrompt(promptId)
   console.log(result)
   ```

6. Review created/updated programs in admin panel

### Executing Agent Prompts

**UI Execution (Recommended):**

1. **Edit View**: Click "Run Agent Prompt" button above document controls
2. **List View**: Click "Run" button in the Actions column

Both buttons:
- Only enabled when status is 'active'
- Show loading state during execution
- Display results in alert dialog
- Auto-refresh page after completion

**Status Lifecycle:**
- `draft` → Initial state for testing
- `active` → Ready for execution (only this status can be run)
- `processing` → Currently executing (set automatically)
- `errored` → Last execution failed (can be reset to active manually)

**Programmatic Execution:**

```typescript
import { runAgentPrompt } from '@/lib/agentPrompts'

// Execute specific prompt
const result = await runAgentPrompt(1)

// Check results
console.log(`Found ${result.total} programs`)
console.log(`Created ${result.created}, Updated ${result.updated}`)
if (result.failed > 0) {
  console.error('Errors:', result.errors)
}
```

**Execution History:**

The `lastRun` field automatically tracks:
- Timestamp of execution
- Total programs returned
- Programs created/updated/failed
- Error details (if any)

View in:
- Edit view: Expandable details with error list
- List view: Compact time-ago format with stats

## API Endpoints

### Payload CMS API

All collections are accessible via Payload's REST API:

- `GET /api/programs` - List programs
- `GET /api/programs/:id` - Get single program
- `GET /api/agent-prompts` - List prompts (admin only)
- etc.

See [Payload REST API docs](https://payloadcms.com/docs/rest-api/overview).

### Custom Endpoints

**Agent Prompt Execution:**
- `POST /api/agent-prompts/:id/execute` - Execute an agent prompt
  - Validates status is 'active'
  - Sets status to 'processing' during execution
  - Returns `RunAgentPromptResult` JSON
  - Updates `lastRun` field with results
  - Implemented as Payload custom endpoint (not Next.js route)

**Removed Endpoints:**
- `/api/scrape/*` - Old scraping endpoints removed in favor of agent system

**Future Considerations:**
- `GET /api/programs/search` - Enhanced search endpoint with filters

## Testing

**Integration Tests:**
```bash
pnpm run test:int
```

**E2E Tests (Playwright):**
```bash
pnpm run test:e2e
```

**Linting:**
```bash
pnpm lint
```

## Deployment

**Production Deployment:**
```bash
pnpm run deploy
```

This runs:
1. `deploy:database` - Runs migrations against production D1
2. `deploy:app` - Builds and deploys to Cloudflare Workers

**Environment-Specific:**
```bash
CLOUDFLARE_ENV=production pnpm run deploy
```

**Important Post-Deployment Steps:**

1. **Create Admin User**: Visit `/admin` and create your first admin user
2. **Create Agent Prompts**: Sample prompts are not auto-seeded - create them manually in the admin panel
3. **Verify Bindings**: Ensure D1, R2, and Queue bindings are configured in Cloudflare dashboard

**Database Reset (if needed):**

If you need to start fresh with a clean database:

```bash
# Create drop script
cat > /tmp/drop_all_tables.sql << 'EOF'
DROP TABLE IF EXISTS `payload_locked_documents_rels`;
DROP TABLE IF EXISTS `_agent_prompts_v`;
DROP TABLE IF EXISTS `agent_prompts`;
DROP TABLE IF EXISTS `_programs_v_rels`;
DROP TABLE IF EXISTS `_programs_v`;
DROP TABLE IF EXISTS `programs_rels`;
DROP TABLE IF EXISTS `programs`;
DROP TABLE IF EXISTS `payload_migrations`;
DROP TABLE IF EXISTS `payload_preferences_rels`;
DROP TABLE IF EXISTS `payload_preferences`;
DROP TABLE IF EXISTS `payload_locked_documents`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `users_sessions`;
DROP TABLE IF EXISTS `payload_kv`;
EOF

# Drop all tables
wrangler d1 execute kingdom1820-db --remote --file=/tmp/drop_all_tables.sql

# Run migrations from scratch
pnpm run deploy:database
```

## Removed Features

These features were removed in favor of the Firecrawl agent approach:

- ❌ **ScrapeJobs Collection** - URL queue management
- ❌ **ScraperSettings Global** - Scheduling and rate limiting configuration
- ❌ **Scraping API Endpoints** - `/api/scrape/batch`, `/api/scrape/process`, `/api/scrape/[jobId]`
- ❌ **URL-based extraction** - Individual URL processing
- ❌ **Crawl jobs** - Domain crawling for page discovery

If you encounter references to these in old code, they should be removed or updated to use the agent system.

## Best Practices

### API Endpoints

**IMPORTANT: Always use Payload-native custom endpoints, not Next.js API routes.**

Payload collections support custom endpoints that integrate with Payload's auth, permissions, and request context:

```typescript
// ✅ CORRECT: Payload custom endpoint
export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  endpoints: [
    {
      path: '/:id/custom-action',
      method: 'post',
      handler: async (req) => {
        const { id } = req.routeParams
        const { payload, user } = req  // Access Payload context
        // ... your logic here
        return Response.json({ success: true })
      },
    },
  ],
  // ... rest of config
}
```

**URL Pattern:** `/api/{collection-slug}/{endpoint-path}`

Example: `POST /api/agent-prompts/123/execute`

**Why use Payload endpoints?**
- ✅ Automatic auth/permissions integration
- ✅ Access to Payload context (req.payload, req.user)
- ✅ Consistent with Payload architecture
- ✅ No need for manual session verification

**Avoid:**
```typescript
// ❌ INCORRECT: Next.js API route
// src/app/api/my-collection/[id]/route.ts
export async function POST(req) { ... }
```

Next.js API routes should only be used for non-Payload endpoints (webhooks, third-party integrations, etc.).

### Working with Agent Prompts

1. **Be Specific**: Clearly list all required fields in the prompt
2. **Request Citations**: Always ask for source URLs
3. **Test in Draft**: Create prompts as 'draft' and test before marking 'active'
4. **Set Credit Limits**: Use `maxCredits` to control costs during testing
5. **Monitor Results**: Check created/updated programs for quality

### Schema Changes

1. Always update both schemas:
   - Payload collection schema
   - Zod validation schema (used by Firecrawl SDK)
2. Generate and review migrations before running
3. Regenerate TypeScript types after migrations
4. Update prompts to request new fields

**Note:** The Firecrawl SDK uses the Zod schema directly - no separate JSON schema needed.

### Performance

1. **Use Indexes**: Fields used in filtering should be indexed
2. **Limit Results**: Use pagination for large datasets
3. **Cache Responses**: Consider caching for frequently accessed data
4. **Monitor Bundle Size**: Keep imports minimal to stay under 3MB limit

### Admin Components

**IMPORTANT: Payload admin components MUST export a default export.**

When creating custom admin components for Payload CMS (used in collection configs via string paths), you must provide both named and default exports:

```typescript
// ✅ CORRECT: Both named and default exports
export const MyComponent: React.FC = () => {
  return <div>My Component</div>
}

export default MyComponent
```

**Why?** Payload's admin component import system requires default exports when components are referenced by string paths in collection configuration.

**Example from AgentPrompts collection:**
```typescript
// In collection config
admin: {
  components: {
    views: {
      edit: {
        default: {
          actions: ['src/components/admin/RunAgentPromptButton']  // Requires default export
        }
      }
    }
  }
}
```

**Component Lifecycle Checks:**

Some components should conditionally render based on document state:

```typescript
// RunAgentPromptButton.tsx - Don't render when creating new documents
export const RunAgentPromptButton: React.FC = () => {
  const { id } = useDocumentInfo()  // Payload hook

  if (!id) {
    return null  // No button when creating new document
  }

  return <Button>Run Agent Prompt</Button>
}
```

This prevents errors when the document doesn't exist yet (e.g., during creation).

## Troubleshooting

### Agent Returns No Results

- Check Firecrawl API key is valid
- Verify prompt is specific enough
- Check `maxCredits` hasn't hit limit
- Review Firecrawl dashboard for errors

### Programs Not Saving

- Check Zod validation errors in console
- Verify required fields are present
- Ensure database has space/quota
- Check D1 binding is configured

### Duplicate Detection Not Working

- Verify `name`, `city`, and `state` are exact matches
- Check for leading/trailing spaces
- Ensure case sensitivity (current implementation is case-sensitive)

### Migration Fails

- Check for data conflicts
- Verify D1 binding is connected
- Review migration SQL in generated file
- Run `pnpm payload migrate:status` to check state

## Future Enhancements

Potential improvements to consider:

1. **Queue System for Agent Runs** - Cloudflare Queues for job processing with priority levels and scheduled execution
2. **Scheduled Agent Runs** - Periodic data refresh using scheduled triggers
3. **Citation Display** - Frontend UI to show data sources on program detail pages
4. **Advanced Duplicate Detection** - Fuzzy matching, normalization
5. **Geocoding Integration** - Auto-populate coordinates from addresses
6. **Map View** - Interactive map of programs using coordinates
7. **Export Functionality** - CSV/PDF export of search results
8. **User Favorites** - Save programs for later review
9. **Analytics** - Track popular searches, program views

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Firecrawl Docs](https://docs.firecrawl.dev)
- [Zod Documentation](https://zod.dev)
