import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
  await db.run(sql`ALTER TABLE \`programs\` ADD \`source_url\` text;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_source_url\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`scrape_jobs_id\` integer REFERENCES scrape_jobs(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_scrape_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`scrape_jobs_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`scrape_jobs_urls\`;`)
  await db.run(sql`DROP TABLE \`scrape_jobs\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`programs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`programs_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "programs_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "programs_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_programs_id_idx\` ON \`payload_locked_documents_rels\` (\`programs_id\`);`)
  await db.run(sql`ALTER TABLE \`programs\` DROP COLUMN \`source_url\`;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` DROP COLUMN \`version_source_url\`;`)
}
