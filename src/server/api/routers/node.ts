import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { nodes, rootNodes } from "~/server/db/schema";
import { v4 as uuid } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';
import { eq, inArray, and } from "drizzle-orm";

export const nodeRouter = createTRPCRouter({
  hello: publicProcedure
    .query(async () => {
      const user = await currentUser();
      if (!user) {
        return { greeting: "Please register" };
      }

      return {
        greeting: `Hello ${user.firstName} ${user.lastName}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), note: z.string(), parentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // Insert the child
        const childId = uuid();
        await tx.insert(nodes).values({
          id: childId,
          userId: ctx.auth.userId,
          name: `${input.name}`,
          note: `${input.note}`
        });

        // Update the parent if needed
        if (input.parentId === "") {
          return;
        }
        const parent = (await tx.select().from(nodes).where(eq(nodes.id, input.parentId)))[0];
        if (parent === undefined) {
          throw new Error(`Invalid parent ID: ${input.parentId}`)
        }
        if (parent.childrenIds === null) {
          parent.childrenIds = [];
        }
        parent.childrenIds.push(childId)
        await tx.update(nodes).set({
          childrenIds: parent.childrenIds,
        }).where(eq(nodes.id, input.parentId));
      })
    }),

  listNodes: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
    .query(({ ctx, input }) => {
    if (ctx.auth.userId === "") {
      throw new Error("Missing userId");
    }

    return ctx.db.select().from(nodes)
      .where(and(
        inArray(nodes.id, input.ids),
        eq(nodes.userId, ctx.auth.userId)
      ))
      .orderBy(nodes.createdAt);
  }),

  createRootNode: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.auth.userId === "") {
        throw new Error("Missing userId");
      }
      await ctx.db.transaction(async (tx) => {
        const nodeId = uuid();
        await tx.insert(nodes).values({
          id: nodeId,
          userId: ctx.auth.userId,
          name: "Root",
        });
        await tx.insert(rootNodes).values({
          userId: ctx.auth.userId,
          nodeId,
        });
      })
    }),

  getRootNode: protectedProcedure.query(({ ctx }) => {
    if (ctx.auth.userId === "") {
      throw new Error("Missing userId");
    }

    return ctx.db.select().from(rootNodes)
      .innerJoin(nodes, eq(rootNodes.nodeId, nodes.id))
      .where(eq(rootNodes.userId, ctx.auth.userId));
  }),
});
