import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validMyKadNumber, validEmail, validId, validStudentNumber } from '../utils/validator.js'

export const getAllStudents = async (req, res, next) => {
    try {
        const [students] = await db.execute('SELECT * FROM student')
        return response(res, 200, 'Students Retrieved successfully', students)
    } catch (error) {
        console.error('[GET ALL STUDENTS ERROR]', error)
        next(error)
    }
}

export const getStudentById = async (req, res, next) => {
    try {
        const student_id = req.params.studentId

        if (!validId(student_id)) {
            return response(res, 400, 'Invalid student id', null, 'INVALID_STUDENT_ID_400')
        }

        const [result] = await db.execute('SELECT * FROM student WHERE student_id = ?', [student_id])

        if (result.length === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student by Id successfully', result[0])
    } catch (error) {
        console.error('[GET STUDENT BY ID ERROR]', error)
        next(error)
    }
}

export const createStudent = async (req, res, next) => {
    try {
        const {
            student_number,
            mykad_number,
            email,
            student_name,
            address,
            gender,
            course_id
        } = req.body

        // Validate required fields
        if (!student_number) {
            return response(res, 400, 'Missing required Matric Number', null, 'REQUIRED_MATRIC_NUMBER_400')
        }

        if (!mykad_number) {
            return response(res, 400, 'Missing required MyKad Number', null, 'REQUIRED_MYKAD_NUMBER_400')
        }

        if (!email) {
            return response(res, 400, 'Missing required Email', null, 'REQUIRED_EMAIL_400')
        }

        if (!student_name) {
            return response(res, 400, 'Missing required Student Name', null, 'REQUIRED_STUDENT_NAME_400')
        }

        if (!course_id) {
            return response(res, 400, 'Missing required Course ID', null, 'REQUIRED_COURSE_ID_400')
        }

        // Validate field formats
        if (!validStudentNumber(student_number)) {
            return response(res, 400, 'Invalid Student Matric', null, 'INVALID_STUDENT_MATRIC_400')
        }

        if (!validEmail(email)) {
            return response(res, 400, 'Invalid email input', null, 'INVALID_EMAIL_400')
        }

        if (!validMyKadNumber(mykad_number)) {
            return response(res, 400, 'Invalid MyKad number. Must be 12 digits (YYMMDDxxxxxx).', null, 'INVALID_MYKAD_NUMBER_400')
        }

        if (!validId(course_id)) {
            return response(res, 400, 'Invalid Course Id', null, 'INVALID_COURSE_ID_400')
        }

        // Check if course exists
        const [courseExists] = await db.execute('SELECT 1 FROM courses WHERE course_id = ?', [course_id])
        
        if (courseExists.length === 0) {
            return response(res, 404, 'Course does not exists', null, 'COURSE_NOT_FOUND_404')
        }

        // Insert student
        const insertQuery = `INSERT INTO student (student_number, mykad_number, email, student_name, address, gender, course_id) VALUES (?, ?, ?, ?, ?, ?, ?)`

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

        return response(res, 201, 'Student created successfully', result)

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Student Already Exists', null, 'DUPLICATE_STUDENT_409')
        }

        console.error('[CREATE STUDENT ERROR]', error)
        next(error)
    }
}

export const updateStudent = async (req, res, next) => {
    try {
        const {
            student_id,
            student_number,
            mykad_number,
            email,
            student_name,
            address,
            gender,
            course_id
        } = req.body

        // Validate required fields
        if (!student_id || !student_number || !mykad_number || !email || !student_name || !course_id) {
            return response(res, 400, 'Missing required fields', null, 'REQUIRED_ERROR_400')
        }

        // Validate field formats
        if (!validId(student_id)) {
            return response(res, 400, 'Invalid student id', null, 'INVALID_STUDENT_ID_400')
        }

        if (!validStudentNumber(student_number)) {
            return response(res, 400, 'Invalid Student Matric', null, 'INVALID_STUDENT_MATRIC_400')
        }

        if (!validEmail(email)) {
            return response(res, 400, 'Invalid email input', null, 'INVALID_EMAIL_400')
        }

        if (!validMyKadNumber(mykad_number)) {
            return response(res, 400, 'Invalid MyKad number. Must be 12 digits (YYMMDDxxxxxx).', null, 'INVALID_MYKAD_NUMBER_400')
        }

        if (!validId(course_id)) {
            return response(res, 400, 'Invalid Course Id', null, 'INVALID_COURSE_ID_400')
        }

        // Check if course exists
        const [courseExists] = await db.execute('SELECT 1 FROM courses WHERE course_id = ?', [course_id])

        if (courseExists.length === 0) {
            return response(res, 404, 'Course does not exists', null, 'COURSE_NOT_FOUND_404')
        }

        // Update student
        const updateQuery = `UPDATE student SET student_number = ?, mykad_number = ?, email = ?, student_name = ?, address = ?, gender = ?, course_id = ? WHERE student_id = ?`

        const values = [
            student_number,
            mykad_number,
            email,
            student_name,
            address || null,
            gender || null,
            course_id,
            student_id
        ]

        const [result] = await db.execute(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student updated successfully',  {
            student_id,
            student_number,
            mykad_number,
            email,
            student_name,
            address,
            gender,
            course_id
        })

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Student already exists', null, 'DUPLICATE_STUDENT_409')
        }

        console.error('[UPDATE STUDENT ERROR]', error)
        next(error)
    }
}

export const deleteStudent = async (req, res, next) => {
    try {
        const student_id = req.params.studentId

        if (!validId(student_id)) {
            return response(res, 400, 'Invalid Student Id', null, 'INVALID_STUDENT_ID_400')
        }

        const [result] = await db.execute('DELETE FROM student WHERE student_id = ?', [student_id])

        if (result.affectedRows === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student deleted successfully', null)

    } catch (error) {
        console.error('[DELETE STUDENT ERROR]', error)
        next(error)
    }
}