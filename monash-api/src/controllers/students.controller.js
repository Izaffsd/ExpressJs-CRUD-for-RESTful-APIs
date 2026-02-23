import db from '../config/connection.js'
import { response } from '../utils/response.js'
import { extractStudentNumberPrefix } from '../validations/studentValidation.js'
import { paginate } from '../utils/pagination.js'

// return full student data
const FIND_STUDENT_BY_ID = `
    SELECT
        s.student_id, s.student_number, s.mykad_number,
        s.email, s.student_name, s.address, s.gender,
        s.course_id, c.course_code, c.course_name,
        s.created_at, s.updated_at
    FROM student s
    JOIN courses c ON s.course_id = c.course_id
    WHERE s.student_id = ?
`

export const getAllStudents = async (req, res, next) => {
    try {
        const baseQuery = `
            SELECT s.*, c.course_code, c.course_name
            FROM student s
            LEFT JOIN courses c USING (course_id)
        `
        const { data, pagination } = await paginate(db, baseQuery, req.query)

        return response(res, 200, 'Students Retrieved successfully', data, null, [], pagination)
    } catch (error) {
        next(error)
    }
}

export const getStudentById = async (req, res, next) => {
    try {
        // req.params is already transformed to snake_case by middleware
        const student_id = req.params.student_id

        const [result] = await db.execute(FIND_STUDENT_BY_ID, [student_id])

        if (result.length === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student retrieved successfully', result[0] || null)
    } catch (error) {
        next(error)
    }
}

export const createStudent = async (req, res, next) => {
    try {
        // req.body is already transformed to snake_case by middleware and validated by Zod
        const {
            student_number,
            mykad_number,
            email,
            student_name,
            address,
            gender
        } = req.body

        // Auto-detect course_id from student_number prefix
        const prefix = extractStudentNumberPrefix(student_number)

        // Get course_id from course_code
        const [courseResult] = await db.execute(
            'SELECT course_id FROM courses WHERE course_code = ?',
            [prefix]
        )

        if (courseResult.length === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }

        const course_id = courseResult[0].course_id  // [ { course_id: 4 } ]

        const insertQuery = `
            INSERT INTO student 
            (student_number, mykad_number, email, student_name, address, gender, course_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        const values = [
            student_number,
            mykad_number,
            email,
            student_name,
            address || null,
            gender || null,
            course_id
        ]

        const [result] = await db.execute(insertQuery, values)

        if (result.affectedRows !== 1) {
            return response(res, 400, 'Student not created', null, 'STUDENT_NOT_CREATED_400')
        }

        const [studentData] = await db.execute(FIND_STUDENT_BY_ID, [result.insertId])

        return response(res, 201, 'Student created successfully', studentData[0] || null)

    } catch (error) {
        next(error)
    }
}

export const updateStudent = async (req, res, next) => {
    try {
        const student_id = req.params.student_id
        
        const {
            mykad_number,
            student_name,
            address,
            gender,
            student_number,
        } = req.body

        const prefix = extractStudentNumberPrefix(student_number)

        // Get course_id from course_code
        const [courseExists] = await db.execute(
            'SELECT course_id FROM courses WHERE course_code = ?',
            [prefix]
        )

        
        if (courseExists.length === 0) {
            return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
        }
        
        const course_id = courseExists[0].course_id

        const updateQuery = `
            UPDATE student 
            SET mykad_number = ?, student_name = ?, address = ?, gender = ?, student_number = ?, course_id = ? 
            WHERE student_id = ?
        `

        const values = [
            mykad_number,
            student_name,
            address || null,
            gender || null,
            student_number,
            course_id,
            student_id
        ]

        const [result] = await db.execute(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        const [studentData] = await db.execute(FIND_STUDENT_BY_ID, [student_id])
        // response() utility automatically transforms to camelCase
        return response(res, 200, 'Student updated successfully', studentData[0] || null)

    } catch (error) {
        next(error)
    }
}

export const deleteStudent = async (req, res, next) => {
    try {
        // req.params is already transformed to snake_case by middleware and validated by Zod
        const student_id = req.params.student_id

        const [result] = await db.execute(
            'DELETE FROM student WHERE student_id = ?',
            [student_id]
        )

        if (result.affectedRows === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student deleted successfully', null)

    } catch (error) {
        next(error)
    }
}