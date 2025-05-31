import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "../auth/organization";
import { timeColumns } from "../../utils/columns";

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  /* 提供商名称（如 openai、azure、anthropic 等） */
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  /* 类型（如 custom 等） */
  providerType: varchar("provider_type", { length: 50 }).notNull(),
  /* 加密后的配置信息（如 API Key） */
  /* 加密后的配置信息 */
  config: text("config").notNull(),
  /* 配置是否有效 */
  isValid: boolean("is_valid").notNull().default(true),
  /* 配额类型 */
  quotaType: varchar("quota_type", { length: 50 }),
  /* 配额上限 */
  quotaLimit: bigint("quota_limit", { mode: "bigint" }),
  /* 已用配额 */
  quotaUsed: bigint("quota_used", { mode: "bigint" }).default(0n),
  /* 最后使用时间 */
  lastUsed: timestamp("last_used"),

  ...timeColumns(),
});

export const providerModels = pgTable("provider_models", {
  /* 主键 */
  id: uuid("id").primaryKey(),
  /* 所属租户 */
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => organization.id),
  /* 提供商名称 */
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  /* 模型名称（如 gpt-3.5-turbo） */
  modelName: varchar("model_name", { length: 255 }).notNull(),
  /* 模型类型（如 chat、embedding、rerank、speech2text） */
  modelType: varchar("model_type", { length: 50 }).notNull(),
  /* 模型专属加密配置 */
  config: text("config").notNull(),
  /* 是否有效 */
  isValid: boolean("is_valid").notNull().default(true),
  
  ...timeColumns(),
});
