import express from 'express'
import { response } from '../utils/response.js'
import studentsRoutes from './students.routes.js'
import coursesRoutes from './courses.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
    response(200, 'Monash API Routes', 'Welcome to the Monash API', res)
})

// Mount route modules
router.use(studentsRoutes)
router.use(coursesRoutes)


export default router