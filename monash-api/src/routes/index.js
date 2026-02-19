import express from 'express'
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

// Frontend sends camelCase → middleware converts request body to snake_case for all routes
router.use(transformRequest)


// Mount route modules
router.use(studentsRoutes)
router.use(coursesRoutes)
// router.use('/auth/', authRoutes)


export default router