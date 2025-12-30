import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`agent_prompts\` ADD \`last_run\` text;`)
  await db.run(sql`ALTER TABLE \`_agent_prompts_v\` ADD \`version_last_run\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`agent_prompts\` DROP COLUMN \`last_run\`;`)
  await db.run(sql`ALTER TABLE \`_agent_prompts_v\` DROP COLUMN \`version_last_run\`;`)
}
