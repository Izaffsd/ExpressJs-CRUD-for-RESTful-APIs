import db from '../config/connection.js'
import { paginate } from '../utils/pagination.js'
import { AppError } from '../utils/AppError.js'

export const getAllCoursesService = async (query) => {
    const baseQuery = 'SELECT * FROM courses'
    const { data, pagination } = await paginate(db, baseQuery, query)
    return { data, pagination }
}

export const getCourseByCodeService = async (course_code) => {
    const [result] = await db.execute('SELECT * FROM courses WHERE course_code = ?', [course_code] )

    if (result.length === 0) {
        throw new AppError('Course does not exist', 404, 'COURSE_NOT_FOUND_404')
    }
    return result[0] || null
}

export const createCourseService = async (courseData) => {
    const { course_code, course_name } = courseData
    const insertQuery = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'
    const values = [course_code, course_name]
    const [result] = await db.execute(insertQuery, values)

    if (result.affectedRows !== 1) {
        throw new AppError('Course not created', 400, 'COURSE_NOT_CREATED_400')
    }

    const [createdCourse] = await db.execute('SELECT * FROM courses WHERE course_id = ?', [result.insertId])
    return createdCourse[0]
}

export const updateCourseService = async (course_id, courseData) => {
    const { course_code, course_name } = courseData

    const updateQuery = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'
    const values = [course_code, course_name, course_id]
    
    const [result] = await db.execute(updateQuery, values)
    
    if (result.affectedRows === 0) {
        throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND_404')
    }
    
    const [updatedCourse] = await db.execute('SELECT * FROM courses WHERE course_id = ?', [course_id])
    return updatedCourse[0]
}

export const deleteCourseService = async (course_id) => {
    const [result] = await db.execute(
        'DELETE FROM courses WHERE course_id = ?',
        [course_id]
    )
    if (result.affectedRows === 0) {
        return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
    }
}