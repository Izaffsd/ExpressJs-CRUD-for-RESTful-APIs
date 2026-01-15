import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validId, validCourseCode } from '../utils/validator.js'

export const getAllCourses = async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM courses')
        return response(res,200, courses, 'All Courses successfully')
    } catch (error) {
        console.error('[GET ALL COURSES ERROR]', error)
        return response(res, 503, null, 'Failed to fetch courses', 'COURSE_FETCH_FAILED')
    }
}

export const getCourseByCode = async (req, res) => {
    try {
        const paramas_course_code = req.params.courseCode

        if (!validCourseCode(paramas_course_code)) {
            return response(res, 400, null, 'Invalid Course Code', 'INVALID_COURSE_CODE')
        }

        const [result] = await db.query('SELECT * FROM courses WHERE course_code = ?', [paramas_course_code])
        
        if (result.length === 0) {
            return response(res, 404, null, 'Course not found', 'COURSE_NOT_FOUND')
        }

        return response(res, 200, result, 'Course by Code successfully', null)
    } catch (error) {
        console.error('[GET COURSE BY CODE ERROR]', error)
        return response(res, 503, null, 'Failed to retrieve course', 'COURSE_RETRIEVE_FAILED')
    }
}

export const createCourse = async (req, res) => {
    try {
        const { course_code, course_name } = req.body

        if (!course_code || !course_name) {
            return response(res, 400, null, 'Missing required fields', 'REQUIRED_ERROR')
        }

        if (!validCourseCode(course_code)) {
            return response(res, 400, null, 'Invalid Course Code', 'INVALID_COURSE_CODE')
        }

        const values = [course_code, course_name]
        const insertQuery = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'

        const [result] = await db.query(insertQuery, values)

        if (result.affectedRows !== 1) {
            return response(res, 400, null, 'Course not created', 'COURSE_NOT_CREATED')
        }

        return response(res, 201, result, 'Course created successfully')

    } catch (error) {
        console.error('[CREATE COURSE ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, null, 'Duplicate Course', 'DUPLICATE_COURSE')
        }

        return response(res, 503, null, 'Failed to create course', 'COURSE_CREATE_FAILED')
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { course_code, course_name, course_id } = req.body

        if (!course_code || !course_name || !course_id) {
            return response(res, 400, null, 'Missing required fields', 'REQUIRED_ERROR')
        }

        if (!validId(course_id)) {
            return response(res, 400, null, 'Invalid Course Id', 'INVALID_COURSE_ID')
        }

        if (!validCourseCode(course_code)) {
            return response(res, 400, null, 'Invalid Course Code', 'INVALID_COURSE_CODE')
        }

        const updateQuery = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'
        const values = [course_code, course_name, course_id]

        const [result] = await db.query(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(res, 404, null, 'Course Not Found', 'COURSE_NOT_FOUND')
        }

        return response(res, 200, result, 'Course updated successfully')

    } catch (error) {
        console.error('[UPDATE COURSE ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, null, 'Duplicate Course Code', 'DUPLICATE_COURSE_CODE')
        }

        return response(res, 503, null, 'Failed to update course', 'COURSE_UPDATE_FAILED')
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const course_Id = req.params.courseId

        if (!validId(course_Id)) {
            return response(res, 400, null, 'Invalid Course Id', 'INVALID_COURSE_ID')
        }

        const [result] = await db.query('DELETE FROM courses WHERE course_id = ?', [course_Id])

        if (result.affectedRows === 0) {
            return response(res, 404, null, 'Course Not Found', 'COURSE_NOT_FOUND')
        }

        return response(res, 200, result, 'Course deleted successfully')

    } catch (error) {
        console.error('[DELETE COURSE ERROR]', error)
        return response(res, 503, null, 'Failed to delete course', 'COURSE_DELETE_FAILED')
    }
}