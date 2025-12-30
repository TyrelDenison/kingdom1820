import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`scrape_jobs_urls\`;`)
  await db.run(sql`DROP TABLE \`scrape_jobs\`;`)
  await db.run(sql`DROP TABLE \`scraper_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`programs_id\` integer,
  	\`agent_prompts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`programs_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agent_prompts_id\`) REFERENCES \`agent_prompts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "programs_id", "agent_prompts_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "programs_id", "agent_prompts_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_programs_id_idx\` ON \`payload_locked_documents_rels\` (\`programs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agent_prompts_id_idx\` ON \`payload_locked_documents_rels\` (\`agent_prompts_id\`);`)
  await db.run(sql`ALTER TABLE \`agent_prompts\` ADD \`max_credits\` numeric;`)
  await db.run(sql`ALTER TABLE \`_agent_prompts_v\` ADD \`version_max_credits\` numeric;`)

  // Seed sample agent prompt
  await payload.create({
    collection: 'agent-prompts',
    data: {
      title: 'Top 100 Christian Business Groups',
      prompt: `Extract data for the 100 largest Christian business peer advisory groups in the US, including non-denominational organizations. For national networks, create separate entries for up to 5 local chapters per organization.

For each program, extract ALL of the following fields:
- name (required)
- description (detailed overview of the program)
- religiousAffiliation (must be either "protestant" or "catholic")
- address (complete street address)
- city
- state (two-letter code: CA, NY, etc.)
- zipCode
- coordinates (latitude and longitude if available)
- meetingFormat (in-person, online, or both)
- meetingFrequency (weekly, monthly, or quarterly)
- meetingLength (1-2, 2-4, or 4-8 hours)
- meetingType (peer-group, forum, or small-group)
- averageAttendance (1-10, 10-20, 20-50, 50-100, or 100+)
- hasConferences (none, annual, or multiple)
- hasOutsideSpeakers (true/false)
- hasEducationTraining (true/false)
- contactEmail
- contactPhone
- website (REQUIRED - the program's official website URL for verification)

Return data matching the provided JSON schema. Include source citations for where you found this information.`,
      status: 'active',
      maxCredits: null,
    },
  })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`scrape_jobs_urls\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text NOT NULL,
  	\`status\` text DEFAULT 'pending',
  	\`program_id_id\` integer,
  	\`error\` text,
  	FOREIGN KEY (\`program_id_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`scrape_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`scrape_jobs_urls_order_idx\` ON \`scrape_jobs_urls\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`scrape_jobs_urls_parent_id_idx\` ON \`scrape_jobs_urls\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`scrape_jobs_urls_program_id_idx\` ON \`scrape_jobs_urls\` (\`program_id_id\`);`)
  await db.run(sql`CREATE TABLE \`scrape_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'queued' NOT NULL,
  	\`job_type\` text DEFAULT 'extract' NOT NULL,
  	\`crawl_url\` text,
  	\`total_urls\` numeric DEFAULT 0,
  	\`processed_urls\` numeric DEFAULT 0,
  	\`successful_urls\` numeric DEFAULT 0,
  	\`failed_urls\` numeric DEFAULT 0,
  	\`error_log\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`scrape_jobs_status_idx\` ON \`scrape_jobs\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`scrape_jobs_updated_at_idx\` ON \`scrape_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`scrape_jobs_created_at_idx\` ON \`scrape_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`scraper_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`frequency\` text DEFAULT '5' NOT NULL,
  	\`batch_size\` numeric DEFAULT 5 NOT NULL,
  	\`last_run\` text,
  	\`delay_between_requests\` numeric DEFAULT 2 NOT NULL,
  	\`max_concurrent\` numeric DEFAULT 3 NOT NULL,
  	\`total_processed\` numeric DEFAULT 0,
  	\`total_successful\` numeric DEFAULT 0,
  	\`total_failed\` numeric DEFAULT 0,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`scrape_jobs_id\` integer REFERENCES scrape_jobs(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_scrape_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`scrape_jobs_id\`);`)
  await db.run(sql`ALTER TABLE \`agent_prompts\` DROP COLUMN \`max_credits\`;`)
  await db.run(sql`ALTER TABLE \`_agent_prompts_v\` DROP COLUMN \`version_max_credits\`;`)
}
