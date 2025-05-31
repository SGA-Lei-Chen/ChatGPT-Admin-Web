import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "schema/auth/user";


export const conversation = pgTable("conversation", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => user.id),
    // orgId: integer("org_id").references(() => organization.id),
    title: varchar("title", { length: 255 }).notNull(),
    // modelId: integer("model_id").references(() => models.id), // AI model used
    createdAt: timestamp("created_at").defaultNow(),
});
