import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Drop temporary table if it exists from previous failed migration
  await db.run(sql`DROP TABLE IF EXISTS __new_agent_prompts;`)

  // Create new table with updated status enum
  await db.run(sql`CREATE TABLE __new_agent_prompts (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'processing', 'errored')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    _status TEXT DEFAULT 'draft',
    max_credits NUMERIC
  );`)

  // Copy data from old table
  await db.run(sql`INSERT INTO __new_agent_prompts SELECT * FROM agent_prompts;`)

  // Drop old table
  await db.run(sql`DROP TABLE agent_prompts;`)

  // Rename new table
  await db.run(sql`ALTER TABLE __new_agent_prompts RENAME TO agent_prompts;`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)

  // Recreate indexes
  await db.run(sql`CREATE INDEX agent_prompts_updated_at_idx ON agent_prompts (updated_at);`)
  await db.run(sql`CREATE INDEX agent_prompts_created_at_idx ON agent_prompts (created_at);`)
  await db.run(sql`CREATE INDEX agent_prompts__status_idx ON agent_prompts (_status);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to original status values
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await db.run(sql`CREATE TABLE __new_agent_prompts (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    _status TEXT DEFAULT 'draft',
    max_credits NUMERIC
  );`)

  await db.run(sql`INSERT INTO __new_agent_prompts SELECT * FROM agent_prompts;`)
  await db.run(sql`DROP TABLE agent_prompts;`)
  await db.run(sql`ALTER TABLE __new_agent_prompts RENAME TO agent_prompts;`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)

  // Recreate indexes
  await db.run(sql`CREATE INDEX agent_prompts_updated_at_idx ON agent_prompts (updated_at);`)
  await db.run(sql`CREATE INDEX agent_prompts_created_at_idx ON agent_prompts (created_at);`)
  await db.run(sql`CREATE INDEX agent_prompts__status_idx ON agent_prompts (_status);`)
}
