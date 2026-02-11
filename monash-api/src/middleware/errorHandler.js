import { response } from '../utils/response.js'
import logger from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR_500'

  // ALWAYS log full details (both dev AND production)
  logger.error({
    message: err.message,
    errorCode: err.errorCode,
    statusCode: err.statusCode,
    stack: err.stack,

    // Database errors
    code: err.code,
    errno: err.errno,
    sql: err.sql || err.sqlMessage,
    sqlState: err.sqlState,
    
    // Request context
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    
    timestamp: new Date().toISOString()
  })

  // Response to CLIENT
    return response(
      res,
      err.statusCode,
      err.message || 'Internal Server Error', // Generic message
      null,
      err.errorCode || 'INTERNAL_SERVER_ERROR_500',
    )

}