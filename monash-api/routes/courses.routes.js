import express from 'express'
import {
    getAllCourses,
    getCourseByCode,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courses.controller.js'

const router = express.Router()

// GET routes
router.get('/courses', getAllCourses)
router.get('/courses/:courseCode', getCourseByCode)

// POST routes
router.post('/courses', createCourse)

// PUT routes
router.put('/courses', updateCourse)

// DELETE routes
router.delete('/courses/:courseId', deleteCourse)

export default router