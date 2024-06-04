DO $$ BEGIN
 CREATE TYPE "public"."nodeTypeEnum" AS ENUM('default', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DELETE FROM "prioritylist-prototype_rootNodes";--> statement-breakpoint
DELETE FROM "prioritylist-prototype_node";--> statement-breakpoint

ALTER TABLE "prioritylist-prototype_node" ALTER COLUMN "id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ALTER COLUMN "user_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ALTER COLUMN "children_ids" SET DATA TYPE varchar(64)[];--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ALTER COLUMN "children_ids" SET DEFAULT ARRAY[]::varchar(64)[];--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ALTER COLUMN "children_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_rootNodes" ALTER COLUMN "node_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ADD COLUMN "completed_node_id" varchar(64);--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" ADD COLUMN "node_type" "nodeTypeEnum" DEFAULT 'default';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prioritylist-prototype_node" ADD CONSTRAINT "completed_node_id_fk" FOREIGN KEY ("completed_node_id") REFERENCES "public"."prioritylist-prototype_node"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prioritylist-prototype_rootNodes" ADD CONSTRAINT "prioritylist-prototype_rootNodes_node_id_prioritylist-prototype_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."prioritylist-prototype_node"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "prioritylist-prototype_node" DROP COLUMN IF EXISTS "completed";