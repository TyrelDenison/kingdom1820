import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_programs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`description\` text,
  	\`religious_affiliation\` text,
  	\`address\` text,
  	\`city\` text,
  	\`state\` text,
  	\`zip_code\` text,
  	\`coordinates_lat\` numeric,
  	\`coordinates_lng\` numeric,
  	\`meeting_format\` text,
  	\`meeting_frequency\` text,
  	\`meeting_length\` numeric,
  	\`meeting_length_range\` text,
  	\`meeting_type\` text,
  	\`average_attendance\` numeric,
  	\`average_attendance_range\` text,
  	\`has_conferences\` text DEFAULT 'none',
  	\`has_outside_speakers\` integer DEFAULT false,
  	\`has_education_training\` integer DEFAULT false,
  	\`annual_price\` numeric DEFAULT 0,
  	\`monthly_price\` numeric DEFAULT 0,
  	\`annual_price_range\` text,
  	\`monthly_price_range\` text,
  	\`contact_email\` text,
  	\`contact_phone\` text,
  	\`website\` text,
  	\`source_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_programs\`("id", "name", "description", "religious_affiliation", "address", "city", "state", "zip_code", "coordinates_lat", "coordinates_lng", "meeting_format", "meeting_frequency", "meeting_length", "meeting_length_range", "meeting_type", "average_attendance", "average_attendance_range", "has_conferences", "has_outside_speakers", "has_education_training", "annual_price", "monthly_price", "annual_price_range", "monthly_price_range", "contact_email", "contact_phone", "website", "source_url", "updated_at", "created_at", "_status") SELECT "id", "name", "description", "religious_affiliation", "address", "city", "state", "zip_code", "coordinates_lat", "coordinates_lng", "meeting_format", "meeting_frequency", "meeting_length", "meeting_length_range", "meeting_type", "average_attendance", "average_attendance_range", "has_conferences", "has_outside_speakers", "has_education_training", "annual_price", "monthly_price", "annual_price_range", "monthly_price_range", "contact_email", "contact_phone", "website", "source_url", "updated_at", "created_at", "_status" FROM \`programs\`;`)
  await db.run(sql`DROP TABLE \`programs\`;`)
  await db.run(sql`ALTER TABLE \`__new_programs\` RENAME TO \`programs\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`programs_religious_affiliation_idx\` ON \`programs\` (\`religious_affiliation\`);`)
  await db.run(sql`CREATE INDEX \`programs_city_idx\` ON \`programs\` (\`city\`);`)
  await db.run(sql`CREATE INDEX \`programs_state_idx\` ON \`programs\` (\`state\`);`)
  await db.run(sql`CREATE INDEX \`programs_zip_code_idx\` ON \`programs\` (\`zip_code\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_format_idx\` ON \`programs\` (\`meeting_format\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_frequency_idx\` ON \`programs\` (\`meeting_frequency\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_length_range_idx\` ON \`programs\` (\`meeting_length_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_type_idx\` ON \`programs\` (\`meeting_type\`);`)
  await db.run(sql`CREATE INDEX \`programs_average_attendance_range_idx\` ON \`programs\` (\`average_attendance_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_conferences_idx\` ON \`programs\` (\`has_conferences\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_outside_speakers_idx\` ON \`programs\` (\`has_outside_speakers\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_education_training_idx\` ON \`programs\` (\`has_education_training\`);`)
  await db.run(sql`CREATE INDEX \`programs_annual_price_range_idx\` ON \`programs\` (\`annual_price_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_monthly_price_range_idx\` ON \`programs\` (\`monthly_price_range\`);`)
  await db.run(sql`CREATE INDEX \`programs_updated_at_idx\` ON \`programs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`programs_created_at_idx\` ON \`programs\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`programs__status_idx\` ON \`programs\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__programs_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_description\` text,
  	\`version_religious_affiliation\` text,
  	\`version_address\` text,
  	\`version_city\` text,
  	\`version_state\` text,
  	\`version_zip_code\` text,
  	\`version_coordinates_lat\` numeric,
  	\`version_coordinates_lng\` numeric,
  	\`version_meeting_format\` text,
  	\`version_meeting_frequency\` text,
  	\`version_meeting_length\` numeric,
  	\`version_meeting_length_range\` text,
  	\`version_meeting_type\` text,
  	\`version_average_attendance\` numeric,
  	\`version_average_attendance_range\` text,
  	\`version_has_conferences\` text DEFAULT 'none',
  	\`version_has_outside_speakers\` integer DEFAULT false,
  	\`version_has_education_training\` integer DEFAULT false,
  	\`version_annual_price\` numeric DEFAULT 0,
  	\`version_monthly_price\` numeric DEFAULT 0,
  	\`version_annual_price_range\` text,
  	\`version_monthly_price_range\` text,
  	\`version_contact_email\` text,
  	\`version_contact_phone\` text,
  	\`version_website\` text,
  	\`version_source_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__programs_v\`("id", "parent_id", "version_name", "version_description", "version_religious_affiliation", "version_address", "version_city", "version_state", "version_zip_code", "version_coordinates_lat", "version_coordinates_lng", "version_meeting_format", "version_meeting_frequency", "version_meeting_length", "version_meeting_length_range", "version_meeting_type", "version_average_attendance", "version_average_attendance_range", "version_has_conferences", "version_has_outside_speakers", "version_has_education_training", "version_annual_price", "version_monthly_price", "version_annual_price_range", "version_monthly_price_range", "version_contact_email", "version_contact_phone", "version_website", "version_source_url", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_name", "version_description", "version_religious_affiliation", "version_address", "version_city", "version_state", "version_zip_code", "version_coordinates_lat", "version_coordinates_lng", "version_meeting_format", "version_meeting_frequency", "version_meeting_length", "version_meeting_length_range", "version_meeting_type", "version_average_attendance", "version_average_attendance_range", "version_has_conferences", "version_has_outside_speakers", "version_has_education_training", "version_annual_price", "version_monthly_price", "version_annual_price_range", "version_monthly_price_range", "version_contact_email", "version_contact_phone", "version_website", "version_source_url", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_programs_v\`;`)
  await db.run(sql`DROP TABLE \`_programs_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__programs_v\` RENAME TO \`_programs_v\`;`)
  await db.run(sql`CREATE INDEX \`_programs_v_parent_idx\` ON \`_programs_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_religious_affiliation_idx\` ON \`_programs_v\` (\`version_religious_affiliation\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_city_idx\` ON \`_programs_v\` (\`version_city\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_state_idx\` ON \`_programs_v\` (\`version_state\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_zip_code_idx\` ON \`_programs_v\` (\`version_zip_code\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_format_idx\` ON \`_programs_v\` (\`version_meeting_format\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_frequency_idx\` ON \`_programs_v\` (\`version_meeting_frequency\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_length_range_idx\` ON \`_programs_v\` (\`version_meeting_length_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_type_idx\` ON \`_programs_v\` (\`version_meeting_type\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_average_attendance_range_idx\` ON \`_programs_v\` (\`version_average_attendance_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_conferences_idx\` ON \`_programs_v\` (\`version_has_conferences\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_outside_speakers_idx\` ON \`_programs_v\` (\`version_has_outside_speakers\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_education_training_idx\` ON \`_programs_v\` (\`version_has_education_training\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_annual_price_range_idx\` ON \`_programs_v\` (\`version_annual_price_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_monthly_price_range_idx\` ON \`_programs_v\` (\`version_monthly_price_range\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_updated_at_idx\` ON \`_programs_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_created_at_idx\` ON \`_programs_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version__status_idx\` ON \`_programs_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_created_at_idx\` ON \`_programs_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_updated_at_idx\` ON \`_programs_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_latest_idx\` ON \`_programs_v\` (\`latest\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_programs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`description\` text,
  	\`religious_affiliation\` text,
  	\`address\` text,
  	\`city\` text,
  	\`state\` text,
  	\`zip_code\` text,
  	\`coordinates_lat\` numeric,
  	\`coordinates_lng\` numeric,
  	\`meeting_format\` text,
  	\`meeting_frequency\` text,
  	\`meeting_length\` text,
  	\`meeting_type\` text,
  	\`average_attendance\` text,
  	\`has_conferences\` text DEFAULT 'none',
  	\`has_outside_speakers\` integer DEFAULT false,
  	\`has_education_training\` integer DEFAULT false,
  	\`contact_email\` text,
  	\`contact_phone\` text,
  	\`website\` text,
  	\`source_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_programs\`("id", "name", "description", "religious_affiliation", "address", "city", "state", "zip_code", "coordinates_lat", "coordinates_lng", "meeting_format", "meeting_frequency", "meeting_length", "meeting_type", "average_attendance", "has_conferences", "has_outside_speakers", "has_education_training", "contact_email", "contact_phone", "website", "source_url", "updated_at", "created_at", "_status") SELECT "id", "name", "description", "religious_affiliation", "address", "city", "state", "zip_code", "coordinates_lat", "coordinates_lng", "meeting_format", "meeting_frequency", "meeting_length", "meeting_type", "average_attendance", "has_conferences", "has_outside_speakers", "has_education_training", "contact_email", "contact_phone", "website", "source_url", "updated_at", "created_at", "_status" FROM \`programs\`;`)
  await db.run(sql`DROP TABLE \`programs\`;`)
  await db.run(sql`ALTER TABLE \`__new_programs\` RENAME TO \`programs\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`programs_religious_affiliation_idx\` ON \`programs\` (\`religious_affiliation\`);`)
  await db.run(sql`CREATE INDEX \`programs_city_idx\` ON \`programs\` (\`city\`);`)
  await db.run(sql`CREATE INDEX \`programs_state_idx\` ON \`programs\` (\`state\`);`)
  await db.run(sql`CREATE INDEX \`programs_zip_code_idx\` ON \`programs\` (\`zip_code\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_format_idx\` ON \`programs\` (\`meeting_format\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_frequency_idx\` ON \`programs\` (\`meeting_frequency\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_length_idx\` ON \`programs\` (\`meeting_length\`);`)
  await db.run(sql`CREATE INDEX \`programs_meeting_type_idx\` ON \`programs\` (\`meeting_type\`);`)
  await db.run(sql`CREATE INDEX \`programs_average_attendance_idx\` ON \`programs\` (\`average_attendance\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_conferences_idx\` ON \`programs\` (\`has_conferences\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_outside_speakers_idx\` ON \`programs\` (\`has_outside_speakers\`);`)
  await db.run(sql`CREATE INDEX \`programs_has_education_training_idx\` ON \`programs\` (\`has_education_training\`);`)
  await db.run(sql`CREATE INDEX \`programs_updated_at_idx\` ON \`programs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`programs_created_at_idx\` ON \`programs\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`programs__status_idx\` ON \`programs\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__programs_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_description\` text,
  	\`version_religious_affiliation\` text,
  	\`version_address\` text,
  	\`version_city\` text,
  	\`version_state\` text,
  	\`version_zip_code\` text,
  	\`version_coordinates_lat\` numeric,
  	\`version_coordinates_lng\` numeric,
  	\`version_meeting_format\` text,
  	\`version_meeting_frequency\` text,
  	\`version_meeting_length\` text,
  	\`version_meeting_type\` text,
  	\`version_average_attendance\` text,
  	\`version_has_conferences\` text DEFAULT 'none',
  	\`version_has_outside_speakers\` integer DEFAULT false,
  	\`version_has_education_training\` integer DEFAULT false,
  	\`version_contact_email\` text,
  	\`version_contact_phone\` text,
  	\`version_website\` text,
  	\`version_source_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__programs_v\`("id", "parent_id", "version_name", "version_description", "version_religious_affiliation", "version_address", "version_city", "version_state", "version_zip_code", "version_coordinates_lat", "version_coordinates_lng", "version_meeting_format", "version_meeting_frequency", "version_meeting_length", "version_meeting_type", "version_average_attendance", "version_has_conferences", "version_has_outside_speakers", "version_has_education_training", "version_contact_email", "version_contact_phone", "version_website", "version_source_url", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_name", "version_description", "version_religious_affiliation", "version_address", "version_city", "version_state", "version_zip_code", "version_coordinates_lat", "version_coordinates_lng", "version_meeting_format", "version_meeting_frequency", "version_meeting_length", "version_meeting_type", "version_average_attendance", "version_has_conferences", "version_has_outside_speakers", "version_has_education_training", "version_contact_email", "version_contact_phone", "version_website", "version_source_url", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_programs_v\`;`)
  await db.run(sql`DROP TABLE \`_programs_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__programs_v\` RENAME TO \`_programs_v\`;`)
  await db.run(sql`CREATE INDEX \`_programs_v_parent_idx\` ON \`_programs_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_religious_affiliation_idx\` ON \`_programs_v\` (\`version_religious_affiliation\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_city_idx\` ON \`_programs_v\` (\`version_city\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_state_idx\` ON \`_programs_v\` (\`version_state\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_zip_code_idx\` ON \`_programs_v\` (\`version_zip_code\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_format_idx\` ON \`_programs_v\` (\`version_meeting_format\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_frequency_idx\` ON \`_programs_v\` (\`version_meeting_frequency\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_length_idx\` ON \`_programs_v\` (\`version_meeting_length\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_meeting_type_idx\` ON \`_programs_v\` (\`version_meeting_type\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_average_attendance_idx\` ON \`_programs_v\` (\`version_average_attendance\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_conferences_idx\` ON \`_programs_v\` (\`version_has_conferences\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_outside_speakers_idx\` ON \`_programs_v\` (\`version_has_outside_speakers\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_has_education_training_idx\` ON \`_programs_v\` (\`version_has_education_training\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_updated_at_idx\` ON \`_programs_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version_created_at_idx\` ON \`_programs_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_version_version__status_idx\` ON \`_programs_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_created_at_idx\` ON \`_programs_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_updated_at_idx\` ON \`_programs_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_latest_idx\` ON \`_programs_v\` (\`latest\`);`)
}
