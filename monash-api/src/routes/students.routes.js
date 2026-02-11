import express from 'express'
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/students.controller.js'

const router = express.Router()

// GET routes
router.get('/students', getAllStudents)
router.get('/students/:studentId', getStudentById)
// router.get('/students/:matricNo', getStudentByMatricNo)

// POST routes
router.post('/students', createStudent)

// PUT routes
router.put('/students', updateStudent)

// DELETE routes
router.delete('/students/:studentId', deleteStudent)

export default router