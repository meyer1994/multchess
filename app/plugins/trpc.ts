import { createTRPCNuxtClient } from 'trpc-nuxt/client'
import { httpLink, loggerLink, type TRPCLink } from '@trpc/client'
import type { AppRouter } from '~~/server/trpc/index'

export default defineNuxtPlugin(() => {
  const links: TRPCLink<AppRouter>[] = []
  if (import.meta.client) links.push(loggerLink())
  links.push(httpLink({ url: '/api/trpc' }))

  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of Nuxt's `useLazyAsyncData`.
   */
  const trpc = createTRPCNuxtClient<AppRouter>({ links })

  return { provide: { trpc } }
})
