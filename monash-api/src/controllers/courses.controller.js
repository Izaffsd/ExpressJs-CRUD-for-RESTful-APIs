import db from '../db/connection.js'
import { response } from '../utils/response.js'

export const getAllCourses = async (req, res, next) => {
    try {
        const [courses] = await db.execute('SELECT * FROM courses')
        return response(res, 200, 'Courses Retrieved successfully', courses)
    } catch (error) {
        console.error('[GET ALL COURSES ERROR]', error)
        next(error)
    }
}

export const getCourseByCode = async (req, res, next) => {
    try {
        const params_course_code = req.params.courseCode

        const [result] = await db.execute('SELECT * FROM courses WHERE course_code = ?', [params_course_code])
        
        if (result.length === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }

        return response(res, 200, 'Course by Code successfully', result[0] || null)
    } catch (error) {
        console.error('[GET COURSE BY CODE ERROR]', error)
        next(error)
    }
}

export const createCourse = async (req, res, next) => {
    try {
        // Data is already validated by Zod middleware
        const { course_code, course_name } = req.body

        const values = [course_code, course_name]
        const insertQuery = 'INSERT INTO courses (course_code, course_name) VALUES (?, ?)'

        const [result] = await db.execute(insertQuery, values)

        if (result.affectedRows !== 1) {
            return response(res, 400, 'Course not created', null, 'COURSE_NOT_CREATED_400')
        }

        return response(res, 201, 'Course created successfully', { courseId: result.insertId, courseName: course_name })

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Course Already Exists', null, 'DUPLICATE_COURSE_409')
        }

        console.error('[CREATE COURSE ERROR]', error)
        next(error)

    }
}

export const updateCourse = async (req, res, next) => {
    try {
        // Data is already validated by Zod middleware
        const { course_code, course_name, course_id } = req.body

        const updateQuery = 'UPDATE courses SET course_code = ?, course_name = ? WHERE course_id = ?'
        const values = [course_code, course_name, course_id]

        const [result] = await db.execute(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }

        return response(res, 200, 'Course updated successfully', { course_code, course_name, course_id })

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Course Code already exists', null, 'DUPLICATE_COURSE_CODE_409')
        }

        console.error('[UPDATE COURSE ERROR]', error)
        next(error)
    }
}

export const deleteCourse = async (req, res, next) => {
    try {
        // Data is already validated by Zod middleware
        const course_id = req.params.courseId

        const [result] = await db.execute('DELETE FROM courses WHERE course_id = ?', [course_id])
        if (result.affectedRows === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }

        return response(res, 200, 'Course deleted successfully', null)

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return response(res, 409, 'Course is referenced by a student', null, 'COURSE_REFERENCED_BY_STUDENT_409')
        console.error('[DELETE COURSE ERROR]', error)
        next(error)
    }
}