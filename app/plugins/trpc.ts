import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import { loggerLink } from '@trpc/client'
import type { AppRouter } from '~~/server/trpc/index'

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of Nuxt's `useLazyAsyncData`.
   */
  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [
      loggerLink(),
      httpBatchLink({ url: '/api/trpc' }),
    ],
  })

  return { provide: { trpc } }
})
