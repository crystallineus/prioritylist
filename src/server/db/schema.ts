// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  text,
  pgEnum,
  foreignKey,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `prioritylist-prototype_${name}`);

export const nodeTypeEnum = pgEnum('nodeTypeEnum', ['default', 'completed']);

export const nodes = createTable(
  "node",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    childrenIds: varchar("children_ids", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar(64)[]`),
    completedNodeId: varchar("completed_node_id", { length: 64 }),
    nodeType: nodeTypeEnum("node_type").default("default"),
    name: varchar("name", { length: 256 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nodesByUserIdIndex: index("nodes_by_user_id_index").on(table.userId),
    completedNodeReference: foreignKey({
      columns: [table.completedNodeId],
      foreignColumns: [table.id],
      name: "completed_node_id_fk"
    }),
  })
);

// Every user has a root node
export const rootNodes = createTable(
  "rootNodes",
  {
    userId: varchar("user_id", { length: 128 }).primaryKey(),
    nodeId: varchar("node_id", { length: 64 }).notNull().unique().references(() => nodes.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);
