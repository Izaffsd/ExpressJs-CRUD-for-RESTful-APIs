import express from 'express'
import { response } from '../utils/response.js'
import studentsRoutes from './students.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
    response(200, 'Monash API Routes', 'Welcome to the API', res)
})

router.use('/students', studentsRoutes)

export default router