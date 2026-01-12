import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validId, validCourseCode } from '../utils/validator.js'

export const getAllCourses = async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM courses')
        return response(200, courses, 'All Courses successfully', res)
    } catch (error) {
        console.error('[GET ALL COURSES ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const getCourseByCode = async (req, res) => {
    try {
        const paramas_course_code = req.params.courseCode

        if (!validCourseCode(paramas_course_code)) {
            return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
        }

        const [result] = await db.query('SELECT * FROM courses WHERE course_code = ?', [paramas_course_code])
        
        if (result.length === 0) {
            return response(404, null, 'Course not found', res, 'COURSE_NOT_FOUND')
        }

        return response(200, result, 'Course by Code successfully', res)
    } catch (error) {
        console.error('[GET COURSE BY CODE ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const createCourse = async (req, res) => {
    try {
        const { course_code, course_name } = req.body

        if (!course_code || !course_name) {
            return response(400, null, 'Missing required fields', res, 'REQUIRED_ERROR')
        }

        if (!validCourseCode(course_code)) {
            return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
        }

        const values = [course_code, course_name]
        const insertQuery = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'

        const [result] = await db.query(insertQuery, values)

        return response(201, result, 'Course created successfully', res)

    } catch (error) {
        console.error('[CREATE COURSE ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(409, null, 'Duplicate Course', res, 'DUPLICATE_COURSE')
        }
        
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { course_code, course_name, course_id } = req.body

        if (!course_code || !course_name || !course_id) {
            return response(400, null, 'Missing required fields', res, 'REQUIRED_ERROR')
        }

        if (!validId(course_id)) {
            return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
        }

        if (!validCourseCode(course_code)) {
            return response(400, null, 'Invalid Course Code', res, 'INVALID_COURSE_CODE')
        }

        const updateQuery = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'
        const values = [course_code, course_name, course_id]

        const [result] = await db.query(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }

        return response(200, result, 'Course updated successfully', res)

    } catch (error) {
        console.error('[UPDATE COURSE ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(409, null, 'Duplicate Course Code', res, 'DUPLICATE_COURSE_CODE')
        }
        
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const course_Id = req.params.courseId

        if (!validId(course_Id)) {
            return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
        }

        const [result] = await db.query('DELETE FROM courses WHERE course_id = ?', [course_Id])

        if (result.affectedRows === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }

        return response(200, result, 'Course deleted successfully', res)

    } catch (error) {
        console.error('[DELETE COURSE ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}