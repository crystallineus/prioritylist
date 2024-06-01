CREATE TABLE IF NOT EXISTS "prioritylist-prototype_node" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"children_ids" varchar(128)[],
	"completed" boolean,
	"rank" text NOT NULL,
	"name" varchar(256) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP TABLE "prioritylist-prototype_listItems";--> statement-breakpoint
DROP TABLE "prioritylist-prototype_lists";--> statement-breakpoint
DROP TABLE "prioritylist-prototype_post";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nodes_by_user_id_index" ON "prioritylist-prototype_node" ("user_id");