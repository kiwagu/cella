import { config } from 'config';
import { boolean, index, json, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from '#/db/schema/users';
import { nanoid } from '#/utils/nanoid';

type Language = (typeof config.languages)[number]['value'];

const languages = config.languages.map((lang) => lang.value) as [string, ...string[]];

export const organizationsTable = pgTable(
  'organizations',
  {
    id: varchar().primaryKey().$defaultFn(nanoid),
    entity: varchar({ enum: ['organization'] })
      .notNull()
      .default('organization'),
    name: varchar().notNull(),
    shortName: varchar(),
    slug: varchar().unique().notNull(),
    country: varchar(),
    timezone: varchar(),
    defaultLanguage: varchar({ enum: languages }).notNull().default(config.defaultLanguage),
    languages: json().$type<Language[]>().notNull().default([config.defaultLanguage]),
    notificationEmail: varchar(),
    emailDomains: json().$type<string[]>().notNull().default([]),
    color: varchar(),
    thumbnailUrl: varchar(),
    bannerUrl: varchar(),
    logoUrl: varchar(),
    websiteUrl: varchar(),
    welcomeText: varchar(),
    authStrategies: json().$type<string[]>().notNull().default([]),
    chatSupport: boolean().notNull().default(false),
    createdAt: timestamp().defaultNow().notNull(),
    createdBy: varchar().references(() => usersTable.id, { onDelete: 'set null' }),
    modifiedAt: timestamp(),
    modifiedBy: varchar().references(() => usersTable.id, { onDelete: 'set null' }),
  },
  (table) => [index('organizations_name_index').on(table.name.desc()), index('organizations_created_at_index').on(table.createdAt.desc())],
);

export type OrganizationModel = typeof organizationsTable.$inferSelect;
export type InsertOrganizationModel = typeof organizationsTable.$inferInsert;
