import express from 'express'
import studentsRoutes from './students.routes.js'
import coursesRoutes from './courses.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
    return res.status(200).json({
        message: 'SUCCESS - Welcome to the Monash API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    })
})

// Mount route modules
router.use(studentsRoutes)
router.use(coursesRoutes)


export default router