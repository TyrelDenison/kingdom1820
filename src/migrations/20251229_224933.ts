import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`agent_prompts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`prompt\` text,
  	\`status\` text DEFAULT 'draft',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE INDEX \`agent_prompts_updated_at_idx\` ON \`agent_prompts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_prompts_created_at_idx\` ON \`agent_prompts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_prompts__status_idx\` ON \`agent_prompts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_agent_prompts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_prompt\` text,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`agent_prompts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_parent_idx\` ON \`_agent_prompts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_version_version_updated_at_idx\` ON \`_agent_prompts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_version_version_created_at_idx\` ON \`_agent_prompts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_version_version__status_idx\` ON \`_agent_prompts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_created_at_idx\` ON \`_agent_prompts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_updated_at_idx\` ON \`_agent_prompts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_agent_prompts_v_latest_idx\` ON \`_agent_prompts_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`agent_prompts_id\` integer REFERENCES agent_prompts(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agent_prompts_id_idx\` ON \`payload_locked_documents_rels\` (\`agent_prompts_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`agent_prompts\`;`)
  await db.run(sql`DROP TABLE \`_agent_prompts_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`programs_id\` integer,
  	\`scrape_jobs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`programs_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`scrape_jobs_id\`) REFERENCES \`scrape_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "programs_id", "scrape_jobs_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "programs_id", "scrape_jobs_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_programs_id_idx\` ON \`payload_locked_documents_rels\` (\`programs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_scrape_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`scrape_jobs_id\`);`)
}
