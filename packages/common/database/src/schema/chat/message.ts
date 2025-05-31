import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "schema/auth/user";
import { conversation } from "./conversation";


export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    role: text('role', { enum: ['user', 'system', 'assistant', 'tool'] }).notNull(),
    conversationId: integer("conversation_id").references(() => conversation.id),
    content: text("content").notNull(), // Raw text
    status: varchar("status", { enum: ["pending", "processed", "failed"] }),
    createdAt: timestamp("created_at").defaultNow(),
});