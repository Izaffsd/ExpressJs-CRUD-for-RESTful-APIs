import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validNoKp, validEmail, validId, validMatricNo } from '../utils/validator.js'

export const getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM student')
        return response(200, students, 'All Students successfully', res)
    } catch (error) {
        console.error('[GET ALL STUDENTS ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const getStudentById = async (req, res) => {
    try {
        const student_Id = req.params.studentId
        
        if (!validId(student_Id)) {
            return response(400, null, 'Invalid student id', res, 'INVALID_STUDENT_ID')
        }

        const [result] = await db.query('SELECT * FROM student WHERE student_id = ?', [student_Id])
        
        if (result.length === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }

        return response(200, result, 'Student by Id successfully', res)
    } catch (error) {
        console.error('[GET STUDENT BY ID ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

// export const getStudentByMatricNo = async (req, res) => {
//     try {
//         const params_ndp = req.params.matricNo

//         if (!validMatricNo(params_ndp)) {
//             return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
//         }

//         const query = `
//             SELECT matric_no, student_name
//             FROM student
//             WHERE matric_no = ?`

//         const [result] = await db.query(query, [params_ndp])
        
//         if (result.length === 0) {
//             return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
//         }

//         return response(200, result, 'Student by matric number successfully', res)
//     } catch (error) {
//         console.error('[GET STUDENT BY MATRIC NO ERROR]', error)
//         return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
//     }
// }

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
        if (!matric_no || !email || !student_name || !course_id || !no_kp) {
            return response(400, null, 'Missing required fields', res, 'REQUIRED_ERROR')
        }

        // Validate field formats
        if (!validMatricNo(matric_no)) {
            return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
        }

        if (!validEmail(email)) {
            return response(400, null, 'Invalid email input', res, 'INVALID_EMAIL')
        }

        if (!validNoKp(no_kp)) {
            return response(400, null, 'Invalid No KP input', res, 'INVALID_NO_KP')
        }

        if (!validId(course_id)) {
            return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
        }

        // Check if course exists
        const [courseExists] = await db.query('SELECT 1 FROM courses WHERE course_id = ?', [course_id])
        
        if (courseExists.length === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }

        // Insert student
        const insertQuery = `
            INSERT INTO student (matric_no, no_kp, email, student_name, address, gender, course_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`

        const values = [
            matric_no,
            no_kp,
            email,
            student_name,
            address || null,
            gender || null,
            course_id
        ]

        const [result] = await db.query(insertQuery, values)

        if (result.affectedRows !== 1) {
            return response(400, null, 'Student not created', res, 'STUDENT_NOT_CREATED')
        }

        const dataResult = {
            dataRows: result.affectedRows,
            dataId: result.insertId
        }

        return response(201, dataResult, 'Student created successfully', res)

    } catch (error) {
        console.error('[CREATE STUDENT ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(409, null, 'Duplicate entry. Please check your information.', res, 'DUPLICATE_STUDENT')
        }
        
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
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
        if (!student_id || !matric_no || !email || !student_name || !course_id || !no_kp) {
            return response(400, null, 'Missing required fields', res, 'REQUIRED_ERROR')
        }

        // Validate field formats
        if (!validId(student_id)) {
            return response(400, null, 'Invalid student id', res, 'INVALID_STUDENT_ID')
        }

        if (!validMatricNo(matric_no)) {
            return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
        }

        if (!validEmail(email)) {
            return response(400, null, 'Invalid email input', res, 'INVALID_EMAIL')
        }

        if (!validNoKp(no_kp)) {
            return response(400, null, 'Invalid No KP input', res, 'INVALID_NO_KP')
        }

        if (!validId(course_id)) {
            return response(400, null, 'Invalid Course Id', res, 'INVALID_COURSE_ID')
        }

        // Check if course exists
        const [courseExists] = await db.query('SELECT 1 FROM courses WHERE course_id = ?', [course_id])
        
        if (courseExists.length === 0) {
            return response(404, null, 'Course Not Found', res, 'COURSE_NOT_FOUND')
        }

        // Update student
        const updateQuery = `
            UPDATE student SET
            matric_no = ?,
            no_kp = ?,
            email = ?,
            student_name = ?,
            address = ?,
            gender = ?,
            course_id = ?
            WHERE student_id = ?
        `

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

        const [result] = await db.query(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }

        const dataResult = {
            dataRows: result.affectedRows,
            dataMessage: result.info
        }

        return response(200, dataResult, 'Student updated successfully', res)

    } catch (error) {
        console.error('[UPDATE STUDENT ERROR]', error)
        
        if (error.code === 'ER_DUP_ENTRY') {
            return response(409, null, 'Duplicate entry. Please check your information.', res, 'DUPLICATE_STUDENT')
        }
        
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const student_id = req.params.studentId

        if (!validId(student_id)) {
            return response(400, null, 'Invalid Student Id', res, 'INVALID_STUDENT_ID')
        }

        const [result] = await db.query('DELETE FROM student WHERE student_id = ?', [student_id])

        if (result.affectedRows === 0) {
            return response(404, null, 'Student Not Found', res, 'STUDENT_NOT_FOUND')
        }

        return response(200, result, 'Student deleted successfully', res)

    } catch (error) {
        console.error('[DELETE STUDENT ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}