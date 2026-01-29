import logger from './logger.js'

export const logDbError = (error, req, meta = {}) => {
  logger.error({
    ...meta,
    dbErrorCode: error.code,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  })
}
