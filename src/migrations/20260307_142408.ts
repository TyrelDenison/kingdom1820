import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`programs\` ADD \`insights\` text;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_insights\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`programs\` DROP COLUMN \`insights\`;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` DROP COLUMN \`version_insights\`;`)
}
