import axiosInstance from '@/lib/axios'
import { Course, CourseResponse } from '@/types'

export const courseService = {
  // Get all courses
  async getAllCourses(): Promise<CourseResponse> {
    try {
      const response = await axiosInstance.get('/courses')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get course by code
  async getCourseByCode(courseCode: string): Promise<CourseResponse> {
    try {
      const response = await axiosInstance.get(`/courses/${courseCode}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create course
  async createCourse(course: Course): Promise<CourseResponse> {
    try {
      const response = await axiosInstance.post('/courses', course)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update course
  async updateCourse(course: Course): Promise<CourseResponse> {
    try {
      const response = await axiosInstance.put('/courses', course)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete course
  async deleteCourse(courseId: number): Promise<CourseResponse> {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}
