import db from '../config/connection.js'
import { response } from '../utils/response.js'
import * as courseService from '../services/courses.service.js'


export const getAllCourses = async (req, res, next) => {
    try {
        const { data, pagination } = await courseService.getAllCoursesService(req.query)
        return response(res, 200, 'Courses Retrieved successfully', data, null, [], pagination)
    } catch (error) {
        next(error)
    }
}

export const getCourseByCode = async (req, res, next) => {
    try {
        const data = await courseService.getCourseByCodeService(req.params.course_code)
        return response(res, 200, 'Course retrieved successfully', data)
    } catch (error) {
        next(error)
    }
}

export const createCourse = async (req, res, next) => {
    try {
        const data = await courseService.createCourseService(req.body)
        return response(res, 201, 'Course created successfully', data)
    } catch (error) {
        next(error)
    }
}

export const updateCourse = async (req, res, next) => {
    try {
        const data = await courseService.updateCourseService(req.params.course_id, req.body)
        return response(res, 200, 'Course updated successfully', data)
    } catch (error) {
        next(error)
    }
}

export const deleteCourse = async (req, res, next) => {
    try {
        await courseService.deleteCourseService(req.params.course_id)
        return response(res, 200, 'Course deleted successfully', null)
    } catch (error) {
        next(error)
    }
}