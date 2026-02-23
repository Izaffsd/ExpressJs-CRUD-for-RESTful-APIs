import { toSnakeCase } from '../utils/caseTransform.js'

// Middleware to transform request body from camelCase to snake_case
// runs before Zod validation

export const transformRequestBody = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = toSnakeCase(req.body)
  }
  next()
}

// Middleware to transform request params from camelCase to snake_case

export const transformRequestParams = (req, res, next) => {
  if (req.params && Object.keys(req.params).length > 0) {
    req.params = toSnakeCase(req.params)
  }
  next()
}

  // Middleware to transform request query from camelCase to snake_case
  // Note: In Express 5, req.query is read-only, so we need to replace it using Object.defineProperty
 
export const transformRequestQuery = (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    const transformed = toSnakeCase(req.query)
    // Replace req.query with transformed object using Object.defineProperty
    Object.defineProperty(req, 'query', {
      value: transformed,
      writable: true,
      enumerable: true,
      configurable: true
    })
  }
  next()
}

// Combined middleware to transform all request data
export const transformRequest = (req, res, next) => {
  transformRequestBody(req, res, () => {})
  transformRequestParams(req, res, () => {})
  transformRequestQuery(req, res, () => {})
  next()
}