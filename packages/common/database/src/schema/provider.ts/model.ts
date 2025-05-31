import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "schema/auth";

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  providerType: varchar("provider_type", { length: 50 }).notNull(),
  encryptedConfig: text("encrypted_config").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
  quotaType: varchar("quota_type", { length: 50 }),
  quotaLimit: bigint("quota_limit", { mode: "bigint" }),
  quotaUsed: bigint("quota_used", { mode: "bigint" }).default(0n),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const providerModels = pgTable("provider_models", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  modelType: varchar("model_type", { length: 50 }).notNull(),
  encryptedConfig: text("encrypted_config").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
