import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { listItems } from "~/server/db/schema";

export const listItemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(listItems).values({
        id: "TODO",
        name: `${input.name} by ${ctx.auth.userId}`,
      });
    }),

  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.listItems.findFirst({
      orderBy: (lists, { desc }) => [desc(lists.createdAt)],
    });
  }),
});
