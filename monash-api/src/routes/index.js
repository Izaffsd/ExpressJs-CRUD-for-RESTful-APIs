import express from 'express'
import db from '../config/connection.js'
import studentsRoutes from './students.routes.js'
import coursesRoutes from './courses.routes.js'
import { transformRequest } from '../middleware/transformRequest.middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
    return res.status(200).json({
        message: 'SUCCESS - Welcome to the Monash API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    })
})

router.get('/health', async (req, res) => {
  try {
    await db.execute('SELECT 1')
    return res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch {
    return res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    })
  }
})

// Frontend sends camelCase → middleware converts request body to snake_case for all routes
router.use(transformRequest)


// Mount route modules
router.use(studentsRoutes)
router.use(coursesRoutes)
// router.use('/auth/', authRoutes)


export default router