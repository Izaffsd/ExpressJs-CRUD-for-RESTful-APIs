import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validNoKp, validEmail, validId, validMatricNo } from '../utils/validator.js'
import { logDbError } from '../utils/logDbError.js'

export const getAllStudents = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT * FROM student')
        return response(res, 200, 'Students Retrieved successfully', students)
    } catch (error) {
        console.error('[GET ALL STUDENTS ERROR]', error)
        logDbError(error, req, {
            errorCode: 'STUDENT_FETCH_FAILED_503',
        })
        return response(res, 503, 'Failed to fetch students', null, 'STUDENT_FETCH_FAILED_503')
    }
}

export const getStudentById = async (req, res) => {
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
        return response(res, 503, 'Failed to retrieve student', null, 'STUDENT_RETRIEVE_FAILED_503')
    }
}

export const createStudent = async (req, res) => {
    try {
        const {
            matric_no,
            no_kp,
            email,
            student_name,
            address,
            gender,
            course_id
        } = req.body

        // Validate required fields
        if (!matric_no) {
            return response(res, 400, 'Missing required Matric Number', null, 'REQUIRED_MATRIC_NO_400')
        }

        if (!no_kp) {
            return response(res, 400, 'Missing required No KP', null, 'REQUIRED_NO_KP_400')
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
        if (!validMatricNo(matric_no)) {
            return response(res, 400, 'Invalid Student Matric', null, 'INVALID_STUDENT_MATRIC_400')
        }

        if (!validEmail(email)) {
            return response(res, 400, 'Invalid email input', null, 'INVALID_EMAIL_400')
        }

        if (!validNoKp(no_kp)) {
            return response(res, 400, 'Invalid No KP input', null, 'INVALID_NO_KP_400')
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
        const insertQuery = `INSERT INTO student (matric_no, no_kp, email, student_name, address, gender, course_id) VALUES (?, ?, ?, ?, ?, ?, ?)`

        const values = [
            matric_no,
            no_kp,
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
        console.error('[CREATE STUDENT ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Student Already Exists', null, 'DUPLICATE_STUDENT_409')
        }

        return response(res, 503, 'Failed to create student', null, 'STUDENT_CREATE_FAILED_503')
    }
}

export const updateStudent = async (req, res) => {
    try {
        const {
            student_id,
            matric_no,
            no_kp,
            email,
            student_name,
            address,
            gender,
            course_id
        } = req.body

        // Validate required fields
        if (!student_id || !matric_no || !no_kp || !email || !student_name || !course_id) {
            return response(res, 400, 'Missing required fields', null, 'REQUIRED_ERROR_400')
        }

        // Validate field formats
        if (!validId(student_id)) {
            return response(res, 400, 'Invalid student id', null, 'INVALID_STUDENT_ID_400')
        }

        if (!validMatricNo(matric_no)) {
            return response(res, 400, 'Invalid Student Matric', null, 'INVALID_STUDENT_MATRIC_400')
        }

        if (!validEmail(email)) {
            return response(res, 400, 'Invalid email input', null, 'INVALID_EMAIL_400')
        }

        if (!validNoKp(no_kp)) {
            return response(res, 400, 'Invalid No KP input', null, 'INVALID_NO_KP_400')
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
        const updateQuery = `UPDATE student SET matric_no = ?, no_kp = ?, email = ?, student_name = ?, address = ?, gender = ?, course_id = ? WHERE student_id = ?`

        const values = [
            matric_no,
            no_kp,
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
            matric_no,
            no_kp,
            email,
            student_name,
            address,
            gender,
            course_id
        })

    } catch (error) {
        console.error('[UPDATE STUDENT ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(res, 409, 'Student already exists', null, 'DUPLICATE_STUDENT_409')
        }

        return response(res, 503, 'Failed to update student', null, 'STUDENT_UPDATE_FAILED_503')
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const student_id = req.params.studentId

        if (!validId(student_id)) {
            return response(res, 400, 'Invalid Student Id', null, 'INVALID_STUDENT_ID_400')
        }

        const [result] = await db.execute('DELETE FROM student WHERE student_id = ?', [student_id])

        if (result.affectedRows === 0) {
            return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
        }

        return response(res, 200, 'Student deleted successfully',  { student_id } )

    } catch (error) {
        console.error('[DELETE STUDENT ERROR]', error)
        return response(res, 503, 'Failed to delete student', null, 'STUDENT_DELETE_FAILED_503')
    }
}