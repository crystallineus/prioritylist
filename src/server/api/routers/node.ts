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

    get: protectedProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(({ input, ctx }) => {
        return ctx.db.select().from(nodes)
          .where(and(
            eq(nodes.userId, ctx.auth.userId),
            eq(nodes.id, input.id)))
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

    // TODO: this is not thread safe and may lose children if another client
    // added children
    updateChildren: protectedProcedure
    .input(z.object({ parentId: z.string().min(1), childrenIds: z.array(z.string().min(1).min(1)) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const parent = (await tx.select().from(nodes).where(eq(nodes.id, input.parentId)))[0];
        if (parent === undefined) {
          throw new Error(`Invalid parent ID: ${input.parentId}`)
        }
        parent.childrenIds = input.childrenIds;
        await tx.update(nodes).set({
          childrenIds: parent.childrenIds,
        }).where(eq(nodes.id, input.parentId));
      })
    }),

  listChildren: protectedProcedure
    .input(z.object({ parentId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const parent = (await tx.select().from(nodes)
          .where(eq(nodes.id, input.parentId)))[0];
        if (parent === undefined) {
          throw new Error(`Invalid parent ID: ${input.parentId}`)
        }

        if (!parent.childrenIds) {
          return [];
        }
        const children = await ctx.db.select().from(nodes)
          .where(and(
            inArray(nodes.id, parent.childrenIds),
            eq(nodes.userId, ctx.auth.userId)
          ));
        const childrenDict: Record<string, typeof children[number]> = {};
        for (const child of children) {
          childrenDict[child.id] = child;
        }
  
        const sorted = [];
        for (const id of parent.childrenIds) {
          const child = childrenDict[id];
          if (!child) {
            throw new Error(`Missing child with id: ${id}`);
          }
          sorted.push(child)
        }
        return sorted;
      })
  }),

  createRootNode: protectedProcedure
    .mutation(async ({ ctx }) => {
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
    return ctx.db.select().from(rootNodes)
      .innerJoin(nodes, eq(rootNodes.nodeId, nodes.id))
      .where(eq(rootNodes.userId, ctx.auth.userId));
  }),
});
