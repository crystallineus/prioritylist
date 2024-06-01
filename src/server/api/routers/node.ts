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

  delete: protectedProcedure
    .input(z.object({ parentId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        await tx.delete(nodes).where(
          and(eq(nodes.id, input.id), eq(nodes.userId, ctx.auth.userId)));

        // Remove the child from the parent
        const parent = (await tx.select().from(nodes).where(eq(nodes.id, input.parentId)))[0];
        if (parent === undefined) {
          throw new Error(`Invalid parent ID: ${input.parentId}`)
        }
        const childrenIds = parent.childrenIds?.filter(childId => childId !== input.id);
        await tx.update(nodes).set({ childrenIds }).where(eq(nodes.id, input.parentId));
      })
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), note: z.string(), parentId: z.string(), idx: z.number().min(0).optional() }))
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
        if (input.idx !== undefined) {
          parent.childrenIds.splice(input.idx, 0, childId);
        } else {
          parent.childrenIds.unshift(childId); // By default add to the top
        }
        await tx.update(nodes).set({
          childrenIds: parent.childrenIds,
        }).where(eq(nodes.id, input.parentId));
      })
    }),

  // reorderChildren re-sorts parent.childrenIds using input.childrenIds.
  // This method NEVER adds new IDs or removes IDs from parent.childrenIds.
  reorderChildren: protectedProcedure
    .input(z.object({ parentId: z.string().min(1), childrenIds: z.array(z.string().min(1).min(1)) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const parent = (await tx.select().from(nodes).where(eq(nodes.id, input.parentId)))[0];
        if (parent === undefined) {
          throw new Error(`Invalid parent ID: ${input.parentId}`)
        }
        const inputPriorities = new Map<string, number>();
        input.childrenIds.forEach((id, index) => {
          inputPriorities.set(id, index);
        })
        const srcPriorities = new Map<string, number>();
        (parent.childrenIds ?? []).forEach((id, index) => {
          srcPriorities.set(id, index);
        })
        const getSortPriority = (id: string): number => {
          const inputPriority = inputPriorities.get(id);
          if (inputPriority !== undefined) {
            return inputPriority;
          }
          const srcPriority = srcPriorities.get(id);
          if (srcPriority !== undefined) {
            return srcPriority;
          }
          throw new Error(`Node ID is invalid: ${id}, parent ID: ${input.parentId}`);
        }

        const finalIds = parent.childrenIds ?? [];
        finalIds.sort((a, b) => getSortPriority(a) - getSortPriority(b));
        await tx.update(nodes).set({childrenIds: finalIds}).where(eq(nodes.id, input.parentId));
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

        if (!parent.childrenIds || parent.childrenIds.length === 0) {
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
