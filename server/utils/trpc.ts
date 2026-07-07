import { initTRPC, TRPCError } from '@trpc/server'
import type { H3Event } from 'h3'

export const createTRPCContext = async (event: H3Event) => {
  /**
  * @see: https://trpc.io/docs/server/context
  */
  return { auth: event.context.auth, event }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Avoid exporting the entire t-object since it's not very descriptive. For
// instance, the use of a t variable is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
  * @see https://trpc.io/docs/server/data-transformers
  */
  // transformer: superjson,
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
type TRPCRateLimiter = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>
}

export const baseProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    type Env = { TRPC_RATE_LIMITER: TRPCRateLimiter }
    const { TRPC_RATE_LIMITER: limitter } = ctx.event.context.cloudflare.env as Env
    const { success } = await limitter.limit({ key: 'TRPC' })
    if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
    return await next()
  })
