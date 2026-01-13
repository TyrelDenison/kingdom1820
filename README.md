# Kingdom1820 - Faith-Based Programs Directory

A Next.js application built with Payload CMS and deployed on Cloudflare Workers. This platform helps discover and connect with Christian business peer advisory groups across the United States.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1)

**Note: This can only be deployed on Paid Workers right now due to size limits.**

## Overview

Kingdom1820 provides a searchable directory of faith-based professional development programs, with an emphasis on Christian business peer advisory groups. The platform features automated data collection via AI-powered web scraping and a user-friendly interface for browsing and filtering programs.

## Key Features

- 🔍 **Advanced Search & Filtering** - Comprehensive faceted search with 11 filters including location, meeting format, frequency, length, type, attendance size, religious affiliation, conferences, speakers, and training programs
- 🤖 **AI-Powered Data Extraction** - Automated program discovery using Firecrawl's agent endpoint
- 📊 **Comprehensive Program Data** - Meeting details, contact info, features, and more
- 🎨 **Professional Design** - Clean, responsive interface with indigo (#560591) color scheme
- ☁️ **Cloudflare Infrastructure** - Deployed on Workers with D1 database and R2 storage

## Collections

### Programs
The main collection storing information about faith-based professional programs:

**Core Information:**
- Name, description
- Religious affiliation (Protestant/Catholic)
- Complete address with geocoded coordinates

**Meeting Details:**
- Format (In-person, Online, Both)
- Frequency (Weekly, Monthly, Quarterly)
- Length (1-2, 2-4, 4-8 hours)
- Type (Peer group, Forum, Small group)
- Average attendance

**Additional Features:**
- Conference offerings (None, Annual, Multiple)
- Outside speakers availability
- Education/training programs

**Contact Information:**
- Email, phone, website
- Source URLs with citations

### AgentPrompts
Manages prompts for the Firecrawl AI agent to extract program data:

- **Title** - Descriptive name for the prompt
- **Prompt** - Natural language instructions for data extraction
- **Status** - Draft or Active
- **Max Credits** - Optional spending limit per execution
- **Version History** - Full tracking of prompt iterations

### Users
Authentication-enabled collection for admin panel access.

### Media
Upload and storage collection for images using R2.

## AI-Powered Data Extraction

Kingdom1820 uses the [Firecrawl SDK](https://firecrawl.dev) (@mendable/firecrawl-js) to autonomously discover and extract program data from across the web.

### How It Works

1. **Agent Prompts** are created in the admin panel with natural language instructions
2. The **Firecrawl SDK** submits the prompt and automatically polls for completion
3. The Firecrawl agent **autonomously searches** the web based on the prompt (no timeout limits)
4. Data is **extracted and validated** against a Zod schema
5. Programs are **automatically saved** as drafts with citations
6. Duplicates are **intelligently updated** based on name, city, and state

**Note:** The SDK handles all polling and timeout management - jobs run until Firecrawl completes them naturally.

### Running an Agent Prompt

```typescript
import { runAgentPrompt } from '@/lib/agentPrompts'

// Execute a prompt by ID
const result = await runAgentPrompt(promptId)

// Returns statistics:
// {
//   total: 100,      // Programs found by agent
//   created: 65,     // New programs created
//   updated: 35,     // Existing programs updated
//   failed: 0,       // Failed saves
//   errors: []       // Error details
// }
```

### Citation Tracking

The agent automatically provides citations for all extracted data. Citations are stored in the `sourceUrl` field as a JSON array:

```json
["https://www.c12group.com/locations", "https://www.example.com/directory"]
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.63
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Workers
- **Data Extraction**: Firecrawl SDK (@mendable/firecrawl-js v4.10.0)
- **Validation**: Zod schemas
- **Styling**: CSS with modern features

## Quick Start - Local Setup

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9 or 10
- Cloudflare account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables in `.env`:
   ```bash
   PAYLOAD_SECRET=your-secret-here
   FIRECRAWL_API_KEY=your-firecrawl-key
   ```

4. Authenticate with Wrangler:
   ```bash
   pnpm wrangler login
   ```

5. Run database migrations:
   ```bash
   pnpm payload migrate
   ```

6. Start development server:
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:3000` and the admin panel at `http://localhost:3000/admin`.

## Working with Cloudflare

Wrangler automatically binds your Cloudflare services for local development. It will create local mock services when running `pnpm dev`.

For available Wrangler commands, run:
```bash
pnpm wrangler help
```

## Deployment

1. Create your migrations:
   ```bash
   pnpm payload migrate:create
   ```

2. Deploy to Cloudflare:
   ```bash
   pnpm run deploy
   ```

This will:
- Run migrations against production D1
- Build the application
- Deploy to Cloudflare Workers

You can integrate these steps into your CI/CD pipeline.

## Database Migrations

When making schema changes:

1. Update collection definitions in `src/collections/`
2. Generate migration:
   ```bash
   pnpm payload migrate:create
   ```
3. Review generated migration in `src/migrations/`
4. Run migration:
   ```bash
   pnpm payload migrate
   ```

## Environment Variables

Required environment variables:

- `PAYLOAD_SECRET` - Secret key for Payload CMS (generate with `openssl rand -hex 32`)
- `FIRECRAWL_API_KEY` - API key for Firecrawl service
- `CLOUDFLARE_ENV` - Environment name (optional, for deployments)

## Project Structure

```
src/
├── app/
│   ├── (frontend)/        # Public-facing pages
│   │   ├── page.tsx       # Home page
│   │   └── programs/      # Program search and detail pages
│   └── api/               # API routes (reserved for future use)
├── collections/           # Payload CMS collections
│   ├── Programs.ts        # Main program data
│   ├── AgentPrompts.ts    # AI extraction prompts
│   ├── Users.ts           # Authentication
│   └── Media.ts           # File uploads
├── lib/
│   ├── firecrawl.ts       # Firecrawl service with Zod schemas
│   └── agentPrompts.ts    # Agent execution utility
├── migrations/            # Database migrations
└── payload.config.ts      # Payload CMS configuration
```

## Known Issues

### GraphQL
Full GraphQL support is not guaranteed when deployed due to [upstream Workers issues](https://github.com/cloudflare/workerd/issues/5175).

### Worker Size Limits
This template requires the Paid Workers plan due to [bundle size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size) (3MB). Keep library imports minimal to avoid hitting limits.

## Observability

Enable logs in the Cloudflare dashboard to monitor your application. [See docs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs) for instructions.

## Support

If you have questions or issues:
- Join the [Payload Discord](https://discord.com/invite/payload)
- Start a [GitHub Discussion](https://github.com/payloadcms/payload/discussions)

## License

MIT
