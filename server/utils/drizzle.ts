import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import memoize from 'memoizee'
import * as schema from '~~/server/db/schema'

export const useDrizzle = memoize(() => {
  const logger = usePino()
  logger.info('Creating new drizzle instance')
  const config = useRuntimeConfig()

  let url: string | null = null
  if (process.env.DATABASE_URL) {
    logger.info('Using DATABASE_URL from environment variable')
    url = process.env.DATABASE_URL
  }
  else if (config.databaseUrl) {
    logger.info('Using NUXT_DATABASE_URL from runtime config')
    url = config.databaseUrl
  }

  if (!url) throw new Error('DATABASE_URL is not set')

  const debug = process.env.NODE_ENV !== 'production'
  const client = createClient({ url })
  return drizzle(client, { schema, logger: debug })
})
