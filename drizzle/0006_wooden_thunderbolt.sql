ALTER TABLE "prioritylist-prototype_lists" ADD COLUMN "note" varchar(256);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_listItems" DROP COLUMN IF EXISTS "note";