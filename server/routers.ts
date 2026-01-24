import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getSolarModelsByUserId, getSolarModelById, createSolarModel, updateSolarModel, deleteSolarModel } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  solar: router({
    list: protectedProcedure.query(({ ctx }) =>
      getSolarModelsByUserId(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getSolarModelById(input.id, ctx.user.id)
      ),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        mw: z.number().positive(),
        capexPerMW: z.number().positive(),
        privateWireCost: z.number().nonnegative(),
        gridConnectionCost: z.number().nonnegative(),
        developmentPremiumPerMW: z.number().nonnegative(),
        opexPerMW: z.number().positive(),
        opexEscalation: z.string(),
        generationPerMW: z.string(),
        degradationRate: z.string(),
        projectLife: z.number().positive(),
        discountRate: z.string(),
        powerPrice: z.number().positive(),
        lcoe: z.string().optional(),
        irr: z.string().optional(),
        paybackPeriod: z.string().optional(),
        totalNpv: z.string().optional(),
      }))
      .mutation(({ ctx, input }) =>
        createSolarModel({
          userId: ctx.user.id,
          ...input,
        })
      ),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        mw: z.number().positive().optional(),
        capexPerMW: z.number().positive().optional(),
        privateWireCost: z.number().nonnegative().optional(),
        gridConnectionCost: z.number().nonnegative().optional(),
        developmentPremiumPerMW: z.number().nonnegative().optional(),
        opexPerMW: z.number().positive().optional(),
        opexEscalation: z.string().optional(),
        generationPerMW: z.string().optional(),
        degradationRate: z.string().optional(),
        projectLife: z.number().positive().optional(),
        discountRate: z.string().optional(),
        powerPrice: z.number().positive().optional(),
        lcoe: z.string().optional(),
        irr: z.string().optional(),
        paybackPeriod: z.string().optional(),
        totalNpv: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return updateSolarModel(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        deleteSolarModel(input.id, ctx.user.id)
      ),
  }),
});

export type AppRouter = typeof appRouter;
