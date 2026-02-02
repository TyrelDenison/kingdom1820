import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Migration: Convert meetingLength and averageAttendance to numeric fields with auto-calculated ranges
 *
 * This migration:
 * 1. Adds meeting_length_range and average_attendance_range columns
 * 2. Copies existing string values to the range columns
 * 3. Converts existing columns to numeric midpoint values
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add new range columns to programs table
  await db.run(sql`ALTER TABLE \`programs\` ADD \`meeting_length_range\` text;`)
  await db.run(sql`ALTER TABLE \`programs\` ADD \`average_attendance_range\` text;`)

  // Add new range columns to versions table
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_meeting_length_range\` text;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` ADD \`version_average_attendance_range\` text;`)

  // Create indexes for the new range columns
  await db.run(sql`CREATE INDEX \`programs_meeting_length_range_idx\` ON \`programs\` (\`meeting_length_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_average_attendance_range_idx\` ON \`programs\` (\`average_attendance_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_meeting_length_range_idx\` ON \`_programs_v\` (\`version_meeting_length_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_average_attendance_range_idx\` ON \`_programs_v\` (\`version_average_attendance_range\`);`)

  // Migrate data: Copy existing string values to range columns, then convert to numeric midpoints
  // For programs table
  await db.run(sql`UPDATE \`programs\` SET \`meeting_length_range\` = \`meeting_length\`;`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance_range\` = \`average_attendance\`;`)

  // Convert meeting_length to numeric midpoints
  await db.run(sql`UPDATE \`programs\` SET \`meeting_length\` = 1.5 WHERE \`meeting_length\` = '1-2';`)
  await db.run(sql`UPDATE \`programs\` SET \`meeting_length\` = 3 WHERE \`meeting_length\` = '2-4';`)
  await db.run(sql`UPDATE \`programs\` SET \`meeting_length\` = 6 WHERE \`meeting_length\` = '4-8';`)

  // Convert average_attendance to numeric midpoints
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = 5 WHERE \`average_attendance\` = '1-10';`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = 15 WHERE \`average_attendance\` = '10-20';`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = 35 WHERE \`average_attendance\` = '20-50';`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = 75 WHERE \`average_attendance\` = '50-100';`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = 150 WHERE \`average_attendance\` = '100+';`)

  // For versions table
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_meeting_length_range\` = \`version_meeting_length\`;`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance_range\` = \`version_average_attendance\`;`)

  // Convert version_meeting_length to numeric midpoints
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_meeting_length\` = 1.5 WHERE \`version_meeting_length\` = '1-2';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_meeting_length\` = 3 WHERE \`version_meeting_length\` = '2-4';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_meeting_length\` = 6 WHERE \`version_meeting_length\` = '4-8';`)

  // Convert version_average_attendance to numeric midpoints
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = 5 WHERE \`version_average_attendance\` = '1-10';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = 15 WHERE \`version_average_attendance\` = '10-20';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = 35 WHERE \`version_average_attendance\` = '20-50';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = 75 WHERE \`version_average_attendance\` = '50-100';`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = 150 WHERE \`version_average_attendance\` = '100+';`)

  // Drop old indexes on the now-numeric columns (filtering should use range columns)
  await db.run(sql`DROP INDEX IF EXISTS \`programs_meeting_length_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`programs_average_attendance_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_version_meeting_length_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_version_average_attendance_idx\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Restore indexes on the original columns
  await db.run(sql`CREATE INDEX \`programs_meeting_length_idx\` ON \`programs\` (\`meeting_length\`);`)
  await db.run(sql`CREATE INDEX \`programs_average_attendance_idx\` ON \`programs\` (\`average_attendance\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_length_idx\` ON \`_programs_v\` (\`version_meeting_length\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_average_attendance_idx\` ON \`_programs_v\` (\`version_average_attendance\`);`)

  // Restore original string values from range columns
  await db.run(sql`UPDATE \`programs\` SET \`meeting_length\` = \`meeting_length_range\`;`)
  await db.run(sql`UPDATE \`programs\` SET \`average_attendance\` = \`average_attendance_range\`;`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_meeting_length\` = \`version_meeting_length_range\`;`)
  await db.run(sql`UPDATE \`_programs_v\` SET \`version_average_attendance\` = \`version_average_attendance_range\`;`)

  // Drop range column indexes
  await db.run(sql`DROP INDEX IF EXISTS \`programs_meeting_length_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`programs_average_attendance_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_meeting_length_range_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_programs_v_version_average_attendance_range_idx\`;`)

  // Drop range columns
  await db.run(sql`ALTER TABLE \`programs\` DROP COLUMN \`meeting_length_range\`;`)
  await db.run(sql`ALTER TABLE \`programs\` DROP COLUMN \`average_attendance_range\`;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` DROP COLUMN \`version_meeting_length_range\`;`)
  await db.run(sql`ALTER TABLE \`_programs_v\` DROP COLUMN \`version_average_attendance_range\`;`)
}
