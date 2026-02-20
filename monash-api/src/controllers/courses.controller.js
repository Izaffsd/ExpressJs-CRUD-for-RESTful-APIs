import db from '../config/connection.js'
import { response } from '../utils/response.js'
import { paginate } from '../utils/pagination.js'

export const getAllCourses = async (req, res, next) => {
    try {
        const { data, pagination } = await paginate(db, 'SELECT * FROM courses', req.query)

        return response(res, 200, 'Courses Retrieved successfully', data, null, [], pagination)
    } catch (error) {
        next(error)
    }
}

export const getCourseByCode = async (req, res, next) => {
    try {
        // req.params is already transformed to snake_case by middleware
        const course_code = req.params.course_code
        
        const [result] = await db.execute(
            'SELECT * FROM courses WHERE course_code = ?',
            [course_code]
        )
        
        if (result.length === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }
        
        return response(res, 200, 'Course retrieved successfully', result[0] || null)
    } catch (error) {
        next(error)
    }
}

export const createCourse = async (req, res, next) => {
    try {
        // req.body is already transformed to snake_case by middleware and validated by Zod
        const { course_code, course_name } = req.body
        
        const values = [course_code, course_name]
        const insertQuery = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'
        
        const [result] = await db.execute(insertQuery, values)
        
        if (result.affectedRows !== 1) {
            return response(res, 400, 'Course not created', null, 'COURSE_NOT_CREATED_400')
        }
        
        return response(res, 201, 'Course created successfully', {
            course_id: result.insertId,
            course_code: course_code,
            course_name: course_name
        })
    } catch (error) {
        next(error)
    }
}

export const updateCourse = async (req, res, next) => {
    try {
        // req.body is already transformed to snake_case by middleware and validated by Zod
        const { course_code, course_name, course_id } = req.body
        
        const updateQuery = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'
        const values = [course_code, course_name, course_id]
        
        const [result] = await db.execute(updateQuery, values)
        
        if (result.affectedRows === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }
        
        return response(res, 200, 'Course updated successfully', {
            course_code,
            course_name,
            course_id
        })
    } catch (error) {
        next(error)
    }
}

export const deleteCourse = async (req, res, next) => {
    try {
        // req.params is already transformed to snake_case by middleware and validated by Zod
        const course_id = req.params.course_id
        
        const [result] = await db.execute(
            'DELETE FROM courses WHERE course_id = ?',
            [course_id]
        )
        
        if (result.affectedRows === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }
        
        return response(res, 200, 'Course deleted successfully', null)
    } catch (error) {
        next(error)
    }
}