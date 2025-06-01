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
import { user } from "../auth/user";
import { organization } from "../auth/organization";

export const message = pgTable("message", {
  id: uuid("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversation.id)
    .notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(), // Raw text
  role: text("role", {
    enum: ["user", "system", "assistant", "tool"],
  }).notNull(),
  //   status: varchar("status", { enum: ["pending", "processed", "failed"] }),

  //   usage: jsonb("usage"),

  ...timeColumns(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const messageClosure = pgTable(
  "message_closure",
  {
    conversationId: uuid("conversation_id")
      .references(() => conversation.id)
      .notNull(),
    ancestor: uuid("ancestor")
      .references(() => message.id, { onDelete: "cascade" })
      .notNull(),
    descendant: uuid("descendant")
      .references(() => message.id, { onDelete: "cascade" })
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
