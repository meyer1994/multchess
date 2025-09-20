export default defineEventHandler((event) => {
  const httpLogger = usePinoHttp()
  const logger = usePino()
  try {
    httpLogger(event.node.req, event.node.res)
  }
  catch (error) {
    // nuxt does not show the error in the console
    logger.error(error)
    throw error
  }
})
