import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { conversation } from "./conversation";
import { timeColumns } from "../../utils/columns";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversation.id),
  content: text("content").notNull(), // Raw text
  role: text("role", {
    enum: ["user", "system", "assistant", "tool"],
  }).notNull(),
  //   status: varchar("status", { enum: ["pending", "processed", "failed"] }),

  //   usage: jsonb("usage"),

  ...timeColumns(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const messageClosures = pgTable(
  "message_closures",
  {
    conversationId: uuid("conversation_id")
      .references(() => conversation.id)
      .notNull(),
    ancestor: uuid("ancestor")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    descendant: uuid("descendant")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    depth: integer("depth").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.ancestor, t.descendant] }),
    index().on(t.conversationId),
    index().on(t.ancestor),
    index().on(t.descendant),
  ]
);
