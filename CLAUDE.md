# Claude Code Reference - Kingdom1820

This document provides technical context for AI assistants working on the Kingdom1820 codebase.

## Project Overview

Kingdom1820 is a Next.js 15 application with Payload CMS 3.63, deployed on Cloudflare Workers. It provides a searchable directory of Christian business peer advisory groups with AI-powered data extraction via Firecrawl.

**Key Technologies:**
- Next.js 15 (App Router)
- Payload CMS 3.63
- Cloudflare D1 (SQLite database)
- Cloudflare R2 (object storage)
- Firecrawl AI Agent (data extraction)
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
│   └── api/                     # Reserved for future API routes
├── collections/
│   ├── Programs.ts              # Main program data collection
│   ├── AgentPrompts.ts          # AI extraction prompts collection
│   ├── Users.ts                 # Admin authentication
│   └── Media.ts                 # R2 file uploads
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

### AgentPrompts Collection (`src/collections/AgentPrompts.ts`)

Manages natural language prompts for the Firecrawl AI agent.

**Schema:**
```typescript
{
  title: string (required)
  prompt: textarea (required, 10+ rows)
  status: 'draft' | 'active' (required, default: 'draft')
  maxCredits: number (optional, min: 0)
  createdAt: timestamp (auto)
  updatedAt: timestamp (auto)
}
```

**Important Notes:**
- Only 'active' prompts should be executed in production
- `maxCredits` controls Firecrawl spending limit (null = no limit)
- Version history enabled for tracking prompt iterations

### Users Collection (`src/collections/Users.ts`)

Standard Payload auth collection for admin access.

### Media Collection (`src/collections/Media.ts`)

R2-backed file uploads with required alt text.

## Data Extraction System

### Firecrawl Service (`src/lib/firecrawl.ts`)

**Key Exports:**

```typescript
// Zod schema matching Programs collection
export const ProgramSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  religiousAffiliation: z.enum(['protestant', 'catholic']).optional(),
  // ... all 19 program fields
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

1. Calls Firecrawl `/agent` endpoint with prompt and schema
2. Agent autonomously searches web based on natural language prompt
3. Returns JSON matching schema with citation fields (e.g., `name_citation`, `address_citation`)
4. Validates response with Zod schema
5. Extracts all `*_citation` fields recursively
6. Returns programs with parsed citations array
7. Handles async jobs with polling (5-minute timeout)

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
   - If exists: Update (both draft and published)
   - If new: Create as draft
4. Return detailed statistics

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
6. `20251230_002230.ts` - **Latest: Agent migration**
   - Drops old scraping tables
   - Adds `max_credits` to agent_prompts
   - Seeds sample agent prompt

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
- `CRON_SECRET` - Secret for cron job authentication (legacy, not currently used)

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

3. Update JSON schema in `getProgramSchemaForFirecrawl()`:
   ```typescript
   properties: {
     // ...
     newField: { type: 'string' },
   }
   ```

4. Generate migration:
   ```bash
   pnpm payload migrate:create
   ```

5. Update prompt to request new field

6. Regenerate types:
   ```bash
   pnpm run generate:types
   ```

### Creating a New Agent Prompt

1. Go to `/admin/collections/agent-prompts`
2. Click "Create New"
3. Set:
   - **Title**: Descriptive name
   - **Prompt**: Natural language instructions (see sample in `sample-agent-prompt.txt`)
   - **Status**: Draft (test first) or Active (production)
   - **Max Credits**: Optional limit

4. Test execution:
   ```typescript
   const result = await runAgentPrompt(promptId)
   console.log(result)
   ```

5. Review created/updated programs in admin panel

### Executing Agent Prompts

Currently manual execution via code. Future: UI button in admin panel.

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

## API Endpoints

### Payload CMS API

All collections are accessible via Payload's REST API:

- `GET /api/programs` - List programs
- `GET /api/programs/:id` - Get single program
- `GET /api/agent-prompts` - List prompts (admin only)
- etc.

See [Payload REST API docs](https://payloadcms.com/docs/rest-api/overview).

### Custom Endpoints

Currently none. Old scraping endpoints (`/api/scrape/*`) have been removed.

Future considerations:
- `POST /api/agent-prompts/:id/execute` - Trigger agent prompt from UI
- `GET /api/programs/search` - Enhanced search endpoint

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
3. `deploy:cron` - Deploys cron worker (if applicable)

**Environment-Specific:**
```bash
CLOUDFLARE_ENV=production pnpm run deploy
```

## Removed Features

These features were removed in favor of the Firecrawl agent approach:

- ❌ **ScrapeJobs Collection** - URL queue management
- ❌ **ScraperSettings Global** - Cron scheduling and rate limiting
- ❌ **Scraping API Endpoints** - `/api/scrape/batch`, `/api/scrape/process`, `/api/scrape/[jobId]`
- ❌ **URL-based extraction** - Individual URL processing
- ❌ **Crawl jobs** - Domain crawling for page discovery

If you encounter references to these in old code, they should be removed or updated to use the agent system.

## Best Practices

### Working with Agent Prompts

1. **Be Specific**: Clearly list all required fields in the prompt
2. **Request Citations**: Always ask for source URLs
3. **Test in Draft**: Create prompts as 'draft' and test before marking 'active'
4. **Set Credit Limits**: Use `maxCredits` to control costs during testing
5. **Monitor Results**: Check created/updated programs for quality

### Schema Changes

1. Always update all three schemas:
   - Payload collection schema
   - Zod validation schema
   - Firecrawl JSON schema
2. Generate and review migrations before running
3. Regenerate TypeScript types after migrations
4. Update prompts to request new fields

### Performance

1. **Use Indexes**: Fields used in filtering should be indexed
2. **Limit Results**: Use pagination for large datasets
3. **Cache Responses**: Consider caching for frequently accessed data
4. **Monitor Bundle Size**: Keep imports minimal to stay under 3MB limit

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

1. **UI for Agent Execution** - Admin panel button to run prompts
2. **Scheduled Agent Runs** - Cron jobs for periodic data refresh
3. **Citation Display** - Frontend UI to show data sources
4. **Advanced Duplicate Detection** - Fuzzy matching, normalization
5. **Geocoding Integration** - Auto-populate coordinates from addresses
6. **Map View** - Interactive map of programs using coordinates
7. **More Filters** - Meeting length, attendance size, features
8. **Export Functionality** - CSV/PDF export of search results
9. **User Favorites** - Save programs for later review
10. **Analytics** - Track popular searches, program views

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Firecrawl Docs](https://docs.firecrawl.dev)
- [Zod Documentation](https://zod.dev)
