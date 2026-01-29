import logger from "./logger.js"

export const response = (
  res,
  statusCode,
  message = "",
  data = null,
  errorCode = null,
  errors = [] 
) => { 

  const success = statusCode < 400
  const resBody = {
    statusCode,
    success,
    message,
  }

 // Include data only for successful responses (data is null for actions like DELETE)
  if (success && data !== null) {
    resBody.data = data
  }

  // Include error details only for failed responses
  if (!success) {
    resBody.errorCode = errorCode
    resBody.timestamp = new Date().toISOString()
    resBody.errors = Array.isArray(errors) ? errors : [errors]

    logger.error({
      statusCode,
      message,
      errorCode,
      errors: resBody.errors,
      method: res.req.method,
      path: res.req.originalUrl,
      body: res.req.body || null,
    })
  }

  return res.status(statusCode).json(resBody)
}