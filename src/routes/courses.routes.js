import express from 'express'
import {
    getAllCourses,
    getCourseByCode,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courses.controller.js'
import { validateZod } from '../middleware/validateZod.js'
import {
    getCourseByCodeSchema,
    createCourseSchema,
    updateCourseSchema,
    deleteCourseSchema
} from '../validations/courseValidation.js'

const router = express.Router()

// GET routes
router.get('/courses', getAllCourses)
router.get('/courses/:course_code', validateZod(getCourseByCodeSchema, 'params'), getCourseByCode)

// POST routes
router.post('/courses', validateZod(createCourseSchema, 'body'), createCourse)

// PUT routes
router.put('/courses', validateZod(updateCourseSchema, 'body'), updateCourse)

// DELETE routes
router.delete('/courses/:course_id', validateZod(deleteCourseSchema, 'params'), deleteCourse)

export default router