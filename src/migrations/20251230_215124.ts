import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`_agent_prompts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_prompt\` text,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_max_credits\` numeric,
  	\`version_last_run\` text,
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
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_agent_prompts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`prompt\` text,
  	\`status\` text DEFAULT 'draft',
  	\`max_credits\` numeric,
  	\`last_run\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_agent_prompts\`("id", "title", "prompt", "status", "max_credits", "last_run", "updated_at", "created_at", "_status") SELECT "id", "title", "prompt", "status", "max_credits", "last_run", "updated_at", "created_at", 'published' FROM \`agent_prompts\`;`)
  await db.run(sql`DROP TABLE \`agent_prompts\`;`)
  await db.run(sql`ALTER TABLE \`__new_agent_prompts\` RENAME TO \`agent_prompts\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`agent_prompts_updated_at_idx\` ON \`agent_prompts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_prompts_created_at_idx\` ON \`agent_prompts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_prompts__status_idx\` ON \`agent_prompts\` (\`_status\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_agent_prompts_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_agent_prompts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`prompt\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`max_credits\` numeric,
  	\`last_run\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_agent_prompts\`("id", "title", "prompt", "status", "max_credits", "last_run", "updated_at", "created_at") SELECT "id", "title", "prompt", "status", "max_credits", "last_run", "updated_at", "created_at" FROM \`agent_prompts\`;`)
  await db.run(sql`DROP TABLE \`agent_prompts\`;`)
  await db.run(sql`ALTER TABLE \`__new_agent_prompts\` RENAME TO \`agent_prompts\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`agent_prompts_updated_at_idx\` ON \`agent_prompts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_prompts_created_at_idx\` ON \`agent_prompts\` (\`created_at\`);`)
}
