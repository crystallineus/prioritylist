CREATE TABLE IF NOT EXISTS "prioritylist-prototype_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prioritylist-prototype_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	"description" varchar(512)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "list_index" ON "prioritylist-prototype_lists" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "prioritylist-prototype_post" ("name");