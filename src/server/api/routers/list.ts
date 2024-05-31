import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { lists } from "~/server/db/schema";
import { v4 as uuid } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

export const listRouter = createTRPCRouter({
  hello: publicProcedure
    .query(async () => {
      const user = await currentUser();
      if (!user) {
        return {greeting: "Please register"};
      }

      return {
        greeting: `Hello ${user.firstName} ${user.lastName}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(lists).values({
        // TODO: why is the type not being recognized?
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        id: uuid(),
        userId: ctx.auth.userId,
        name: `${input.name} by ${ctx.auth.userId}`,
      });
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.lists.findMany({
      orderBy: (lists, { desc }) => [desc(lists.createdAt)],
    });
  }),
});
