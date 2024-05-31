CREATE TABLE IF NOT EXISTS "prioritylist-prototype_listItems" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"listId" varchar(128),
	"name" varchar(256),
	"content" text,
	"url" varchar(1024),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "list_index";--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_lists" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_lists" ADD COLUMN "user_id" varchar(128);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "list_items_by_list_id_index" ON "prioritylist-prototype_listItems" ("listId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lists_by_user_id_index" ON "prioritylist-prototype_lists" ("user_id");--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_lists" DROP COLUMN IF EXISTS "desc";