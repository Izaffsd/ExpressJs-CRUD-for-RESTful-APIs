import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { validNoKp, validEmail, validId, validMatricNo } from '../utils/validator.js'

export const getAllStudents = async (req, res) => {
    try {
        const students = await db.query('SELECT * FROM students')
        return response(200, students, 'Students fetched successfully', res)
    } catch (error) {
        console.error(error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}