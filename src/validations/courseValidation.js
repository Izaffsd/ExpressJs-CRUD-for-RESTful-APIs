import { z } from 'zod'

// JSON almost always sends strings.

// client sent id as string, so need to convert it to number
const courseIdParam = z.string()
  .regex(/^\d+$/, 'ID must be a number')
  .transform(Number)

const courseCode = z.string()
  .min(1, 'Course code is required')
  .transform(code => code.toUpperCase().trim())
  .refine(code => /^[A-Z]{2,4}$/.test(code), {
    message: 'Invalid course code format (2-4 uppercase letters, e.g., SE, LAW)'
  })

const courseName = z.string()
  .min(1, 'Course name is required')
  .max(100, 'Course name must not exceed 100 characters')
  .trim()

const courseId = z.number()
  .int('Course ID must be a number')
  .positive('Course ID must be positive')

// Schemas
export const getCourseByCodeSchema = z.object({
  course_code: z.string()
    .min(1, 'Course code is required')
    .transform(codeChars => codeChars.toUpperCase().trim())
    .refine(codeChars => /^[A-Z]{2,4}$/.test(codeChars), {
      message: 'Invalid course code format'
    })
})

export const deleteCourseSchema = z.object({
  course_id: courseIdParam
})

export const createCourseSchema = z.object({
  course_code: courseCode,
  course_name: courseName
})

export const updateCourseSchema = z.object({
  course_code: courseCode,
  course_name: courseName,
  course_id: courseId
})

