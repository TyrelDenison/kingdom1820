import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`scraper_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`frequency\` text DEFAULT '5' NOT NULL,
  	\`batch_size\` numeric DEFAULT 5 NOT NULL,
  	\`last_run\` text,
  	\`delay_between_requests\` numeric DEFAULT 2 NOT NULL,
  	\`max_concurrent\` numeric DEFAULT 3 NOT NULL,
  	\`total_processed\` numeric DEFAULT 0,
  	\`total_successful\` numeric DEFAULT 0,
  	\`total_failed\` numeric DEFAULT 0,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`scraper_settings\`;`)
}
