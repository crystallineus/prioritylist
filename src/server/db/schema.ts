// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `prioritylist-prototype_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
    description: varchar("description", { length: 512 }),
  },
  (self) => ({
    nameIndex: index("name_idx").on(self.name),
  })
);

export const lists = createTable(
  "lists",
  {
    id: varchar("id", {length: 128}).primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (self) => ({
    listsByUserIdIndex: index("lists_by_user_id_index").on(self.userId),
  })
);

export const listItems = createTable(
  "listItems",
  {
    id: varchar("id", {length: 128}).primaryKey(),
    listId: varchar("listId", {length: 128}),
    name: varchar("name", { length: 256 }),
    content: text("content"),
    url: varchar("url", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (self) => ({
    listItemsByListId: index("list_items_by_list_id_index").on(self.listId),
  })
);
