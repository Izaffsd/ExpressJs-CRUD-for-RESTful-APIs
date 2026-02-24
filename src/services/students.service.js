import db from '../config/connection.js'
import { extractStudentNumberPrefix } from '../validations/studentValidation.js'
import { paginate } from '../utils/pagination.js'
import { AppError } from '../utils/AppError.js'

// return full student data
const FIND_STUDENT_BY_ID = `
    SELECT
        s.*,
        c.course_code, c.course_name,
        s.created_at, s.updated_at
    FROM students s
    JOIN courses c ON s.course_id = c.course_id
    WHERE s.student_id = ?
`

export const getAllStudentsService = async (query) => {
    const baseQuery = `
        SELECT s.*, c.course_code, c.course_name
        FROM students s
        LEFT JOIN courses c USING (course_id)
    `
    const { data, pagination } = await paginate(db, baseQuery, query)
    return { data, pagination }
}

export const getStudentByIdService = async (student_id) => {
    const [result] = await db.execute(FIND_STUDENT_BY_ID, [student_id])

    if (result.length === 0) {
        throw new AppError('Student does not exist', 404, 'STUDENT_NOT_FOUND_404')
    }

    return result[0] || null
}

export const createStudentService = async ( data ) => {
    const {
        student_number,
        mykad_number,
        email,
        student_name,
        address,
        gender
    } = data

    // Auto-detect course_id from student_number prefix
    const prefix = extractStudentNumberPrefix(student_number)

    // Get course_id from course_code
    const [courseResult] = await db.execute(
        'SELECT course_id FROM courses WHERE course_code = ?',
        [prefix]
    )

    if (courseResult.length === 0) {
        throw new AppError('Course does not exist', 404, 'COURSE_NOT_FOUND_404')
    }

    const course_id = courseResult[0].course_id  // [ { course_id: 4 } ]

    const insertQuery = `
        INSERT INTO students
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
        throw new AppError('Student not created', 400, 'STUDENT_NOT_CREATED_400')
    }

    const [createdStudent] = await db.execute(FIND_STUDENT_BY_ID, [result.insertId])
    return createdStudent[0]
}

export const updateStudentService = async (student_id, data) => {
    const {
        mykad_number,
        student_name,
        address,
        gender,
        student_number,
    } = data

    const prefix = extractStudentNumberPrefix(student_number)

    // Get course_id from course_code
    const [courseExists] = await db.execute(
        'SELECT course_id FROM courses WHERE course_code = ?',
        [prefix]
    )


    if (courseExists.length === 0) {
        throw new AppError('Course does not exist', 404, 'COURSE_NOT_FOUND_404')
    }

    const course_id = courseExists[0].course_id

    const updateQuery = `
        UPDATE students
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
        throw new AppError('Student does not exist', 404, 'STUDENT_NOT_FOUND_404')
    }

    const [studentData] = await db.execute(FIND_STUDENT_BY_ID, [student_id])
    return studentData[0] || null

}

export const deleteStudentService = async (student_id) => {
    const [result] = await db.execute(
        'DELETE FROM students WHERE student_id = ?',
        [student_id]
    )
    if (result.affectedRows === 0) {
        throw new AppError('Student does not exist', 404, 'STUDENT_NOT_FOUND_404')
    }
}