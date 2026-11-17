import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const leads = sqliteTable('leads', {
 id: text('id').primaryKey(), name: text('name').notNull(), phone: text('phone').notNull(), destination: text('destination').notNull(), purpose: text('purpose').notNull(), language: text('language').notNull(), status: text('status').notNull().default('new'), note: text('note').notNull().default(''), source: text('source').notNull().default('direct'), createdAt: integer('created_at').notNull(), consentVersion: text('consent_version').notNull().default('2026-11-16'), consentAt:integer('consent_at'), consentText:text('consent_text'), consentMethod:text('consent_method')
}, t=>[index('leads_created_idx').on(t.createdAt),index('leads_phone_idx').on(t.phone)]);
