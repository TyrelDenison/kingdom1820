import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add new pricing columns to programs table
  await db.run(sql`ALTER TABLE \`programs\` ADD \`annual_price\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`programs\` ADD \`monthly_price\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`programs\` ADD \`annual_price_range\` text;`)
  await db.run(sql`ALTER TABLE \`programs\` ADD \`monthly_price_range\` text;`)

  // Create indexes for price range filtering
  await db.run(sql`CREATE INDEX \`programs_annual_price_range_idx\` ON \`programs\` (\`annual_price_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_monthly_price_range_idx\` ON \`programs\` (\`monthly_price_range\`);`)

  // Add same columns to versions table
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_annual_price\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_monthly_price\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_annual_price_range\` text;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_monthly_price_range\` text;`)

  // Create indexes for versions table
  await db.run(sql`CREATE INDEX \`_programs_v_version_annual_price_range_idx\` ON \`_programs_v\` (\`version_annual_price_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_monthly_price_range_idx\` ON \`_programs_v\` (\`version_monthly_price_range\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop indexes
  await db.run(sql`DROP INDEX IF EXISTS \`programs_annual_price_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`programs_monthly_price_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_annual_price_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_monthly_price_range_idx\`;`)

  // Note: SQLite doesn't support DROP COLUMN easily, so down migration is limited
  // In production, you would need to recreate the table without these columns
}
