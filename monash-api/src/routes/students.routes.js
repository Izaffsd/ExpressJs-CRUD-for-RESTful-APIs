import express from 'express'
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/students.controller.js'
import { validateZod } from '../middleware/validateZod.js'
import {
    getStudentByIdSchema,
    createStudentSchema,
    updateStudentSchema,
    deleteStudentSchema
} from '../validations/studentValidation.js'

const router = express.Router()

// GET routes
router.get('/students', getAllStudents)
router.get('/students/:student_id', validateZod(getStudentByIdSchema, 'params'), getStudentById)

// POST routes
router.post('/students', validateZod(createStudentSchema, 'body'), createStudent)

// PUT routes
router.put('/students', validateZod(updateStudentSchema, 'body'), updateStudent)

// DELETE routes
router.delete('/students/:student_id', validateZod(deleteStudentSchema, 'params'), deleteStudent)

export default router