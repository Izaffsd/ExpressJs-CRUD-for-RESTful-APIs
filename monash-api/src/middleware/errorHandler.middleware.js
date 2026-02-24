import { AppError } from '../utils/AppError.js'
import { response } from '../utils/response.js'
import logger from '../utils/logger.js'

export const MYSQL_ERRORS = {

  ER_DUP_ENTRY: (err) => {
    const match = err.message.match(/Duplicate entry '(.+?)'/)
    const value = match ? match[1] : 'Record'

    return {
      status: 409,
      message: `'${value}' already exists`,
      errorCode: 'DUPLICATE_RECORD_409'
    }
  },

  ER_NO_REFERENCED_ROW_2: () => ({
    status: 400,
    message: 'Referenced record does not exist',
    errorCode: 'INVALID_REFERENCE_400'
  }),

  ER_ROW_IS_REFERENCED_2: () => ({
    status: 409,
    message: 'Cannot delete this record because it is being used by other data',
    errorCode: 'RECORD_IN_USE_409'
  })
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

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

  // Known operational errors (AppError)
  if (err instanceof AppError) {
      return response(res, err.statusCode, err.message, null, err.errorCode)
  }

  // Response to CLIENT
  if (err.errorCode === 'RESOURCE_NOT_FOUND_404') return response(res, 404, 'Resource not found', null, 'RESOURCE_NOT_FOUND_404')

  const mysqlHandler = MYSQL_ERRORS[err.code]
  if (mysqlHandler) {
    const mysql = mysqlHandler(err)
    return response(res, mysql.status, mysql.message, null, mysql.errorCode)
  }

    return response(
      res,
      err.statusCode,
      'Internal Server Error', // Generic message
      null,
      'INTERNAL_SERVER_ERROR_500',
    )

}