import { response } from '../utils/response.js'
import * as studentService from '../services/students.service.js'


export const getAllStudents = async (req, res, next) => {
    try {
        const { data, pagination } = await studentService.getAllStudentsService(req.query)
        return response(res, 200, 'Students Retrieved successfully', data, null, [], pagination)
    } catch (error) {
        next(error)
    }
}

export const getStudentById = async (req, res, next) => {
    try {
        const data = await studentService.getStudentByIdService(req.params.student_id)
        return response(res, 200, 'Student retrieved successfully', data)
    } catch (error) {
        next(error)
    }
}

export const createStudent = async (req, res, next) => {
    try {
        const data = await studentService.createStudentService(req.body)
        return response(res, 201, 'Student created successfully', data)
    } catch (error) {
        next(error)
    }
}

export const updateStudent = async (req, res, next) => {
    try {
        const data = await studentService.updateStudentService(req.params.student_id, req.body)
        return response(res, 200, 'Student updated successfully', data)
    } catch (error) {
        next(error)
    }
}

export const deleteStudent = async (req, res, next) => {
    try {
        await studentService.deleteStudentService(req.params.student_id)
        return response(res, 200, 'Student deleted successfully', null)
    } catch (error) {
        next(error)
    }
}