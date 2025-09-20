import pino, { type TransportSingleOptions } from 'pino'
import pinoHttp from 'pino-http'
import memoize from 'memoizee'

const buildPino = memoize(() => {
  let level = process.env.LOG_LEVEL ?? 'debug'
  level = process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  level = level.toLowerCase()

  let transport: TransportSingleOptions | undefined = undefined
  if (process.env.NODE_ENV === 'development')
    transport = { target: 'pino-pretty', options: { ignore: 'env,req.headers,res.headers' } }

  return pino({ level, base: { env: process.env.NODE_ENV }, transport })
})

const buildPinoHttp = memoize(() => {
  return pinoHttp({ logger: buildPino() })
})

export const usePino = () => buildPino()
export const usePinoHttp = () => buildPinoHttp()
