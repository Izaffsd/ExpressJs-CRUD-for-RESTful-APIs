import { response } from '../utils/response.js'

/**
 * Global error handling middleware
 * This catches any errors that weren't handled in route handlers
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err.stack)
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return response(409, null, 'Duplicate entry detected', res, 'DUPLICATE_ENTRY')
    }
    
    // Default server error
    return response(500, null, 'Internal server error', res, 'INTERNAL_ERROR')
}

/**
 * 404 Not Found middleware
 * This catches any requests to undefined routes
 */
export const notFoundHandler = (req, res) => {
    return response(404, null, 'Route not found', res, 'ROUTE_NOT_FOUND')
}