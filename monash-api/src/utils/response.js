import { toCamelCase } from './caseTransform.js'

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
    // Transform data to camelCase before sending
    resBody.data = toCamelCase(data)
  }

  // Include error details only for failed responses
  if (!success) {
    resBody.errorCode = errorCode
    resBody.timestamp = new Date().toISOString()
    resBody.errors = Array.isArray(errors) ? errors : [errors]
  }

  return res.status(statusCode).json(resBody)
}