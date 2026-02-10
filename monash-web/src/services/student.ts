import axiosInstance from '@/lib/axios'
import { Student, StudentResponse } from '@/types'

export const studentService = {
  // Get all students
  async getAllStudents(): Promise<StudentResponse> {
    try {
      const response = await axiosInstance.get('/students')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get student by ID
  async getStudentById(studentId: number): Promise<StudentResponse> {
    try {
      const response = await axiosInstance.get(`/students/${studentId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create student
  async createStudent(student: Student): Promise<StudentResponse> {
    try {
      const response = await axiosInstance.post('/students', student)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update student
  async updateStudent(student: Student): Promise<StudentResponse> {
    try {
      const response = await axiosInstance.put('/students', student)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete student
  async deleteStudent(studentId: number): Promise<StudentResponse> {
    try {
      const response = await axiosInstance.delete(`/students/${studentId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}
