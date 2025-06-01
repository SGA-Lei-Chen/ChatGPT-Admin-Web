import {
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "../auth/organization";
import { user } from "../auth/user";
import { timeColumns } from "../../utils/columns";

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id")    .notNull().references(() => organization.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),

  title: varchar("title", { length: 255 }).notNull(),

  // modelId: integer("model_id").references(() => models.id), // AI model used

  ...timeColumns(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
