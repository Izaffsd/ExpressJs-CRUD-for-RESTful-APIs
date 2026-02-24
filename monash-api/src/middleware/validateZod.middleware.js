import { response } from '../utils/response.js'

// Example: validateZod(studentRegisterSchema, 'body')
export const validateZod = (schema, source = 'body') => {

  return (request, res, next) => {
    const data = request[source] // source = { validatedData }
    const result = schema.safeParse(data) // zod check status result = { success and data or fail and list error }

    if (!result.success) {
      const firstIssue = result.error.issues[0] // issues = ZodError custom format
      const fieldName = firstIssue.path[0] || 'field' // path: ["email"]
      const errorCode = `INVALID_${String(fieldName).toUpperCase()}_400`

        return response(res, 400, firstIssue.message, null, errorCode)
      }

    request[source] = result.data // replace request[source] data with validated data
    next() // pass to controller
  }
}