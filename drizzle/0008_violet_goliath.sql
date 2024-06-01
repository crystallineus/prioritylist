CREATE TABLE IF NOT EXISTS "prioritylist-prototype_rootNodes" (
	"user_id" varchar(128) PRIMARY KEY NOT NULL,
	"node_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "prioritylist-prototype_rootNodes_node_id_unique" UNIQUE("node_id")
);
--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" DROP COLUMN IF EXISTS "rank";