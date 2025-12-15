import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`programs\` (
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
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
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
  await db.run(sql`CREATE TABLE \`programs_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`programs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`programs_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`programs_rels_order_idx\` ON \`programs_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`programs_rels_parent_idx\` ON \`programs_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`programs_rels_path_idx\` ON \`programs_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`programs_rels_programs_id_idx\` ON \`programs_rels\` (\`programs_id\`);`)
  await db.run(sql`CREATE TABLE \`_programs_v\` (
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
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
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
  await db.run(sql`CREATE TABLE \`_programs_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`programs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_programs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`programs_id\`) REFERENCES \`programs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_programs_v_rels_order_idx\` ON \`_programs_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_rels_parent_idx\` ON \`_programs_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_rels_path_idx\` ON \`_programs_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_programs_v_rels_programs_id_idx\` ON \`_programs_v_rels\` (\`programs_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`programs_id\` integer REFERENCES programs(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_programs_id_idx\` ON \`payload_locked_documents_rels\` (\`programs_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`programs\`;`)
  await db.run(sql`DROP TABLE \`programs_rels\`;`)
  await db.run(sql`DROP TABLE \`_programs_v\`;`)
  await db.run(sql`DROP TABLE \`_programs_v_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
