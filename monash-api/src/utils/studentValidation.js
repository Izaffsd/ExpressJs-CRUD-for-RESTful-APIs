import { z } from 'zod'

// Helper function to extract prefix from student_number (e.g., "SE23001" -> "SE")
export const extractStudentNumberPrefix = (studentNumber) => {
  const match = studentNumber.match(/^([A-Z]{2,4})/)
  return match ? match[1] : null
}

// client sent id as string, so we need to convert it to number
const idParam = z.string()
  .regex(/^\d+$/, 'ID must be a number')
  .transform(Number)

const studentNumber = z.string()
  .min(1, 'Student number is required')
  .transform(val => val.toUpperCase().trim())
  .refine(val => /^[A-Z]{2,4}[0-9]{4,5}$/.test(val), {
    message: 'Invalid student number format (e.g., LAW0504, SE03001)'
  })

const myKadNumber = z.string()
  .length(12, 'MyKad number must be exactly 12 digits')
  .regex(/^\d{12}$/, 'MyKad number must contain only digits')
  .refine((val) => {
    const mm = val.substring(2, 4)
    const dd = val.substring(4, 6)
    const month = parseInt(mm, 10)
    const day = parseInt(dd, 10)
    return month >= 1 && month <= 12 && day >= 1 && day <= 31
  }, {
    message: 'Invalid MyKad number format (YYMMDDxxxxxx)'
  })

const email = z.string()
  .trim()
  .toLowerCase()
  .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email format'
  })

const studentName = z.string()
  .min(1, 'Student name is required')
  .max(100, 'Student name must not exceed 100 characters')
  .trim()

const courseId = z.number()
  .int('Course ID must be an integer')
  .positive('Course ID must be positive')

// Schemas
export const getStudentByIdSchema = z.object({
  studentId: idParam
})


export const createStudentSchema = z.object({
  student_number: studentNumber,
  mykad_number: myKadNumber,
  email: email,
  student_name: studentName,
  address: z.string().max(255, 'Address must not exceed 255 characters').trim().optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional().nullable()
})

export const updateStudentSchema = z.object({
  student_id: courseId,
  mykad_number: myKadNumber,
  student_name: studentName,
  address: z.string().max(255, 'Address must not exceed 255 characters').trim().optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional().nullable(),
  course_id: courseId
})

export const deleteStudentSchema = z.object({
  studentId: idParam
})
