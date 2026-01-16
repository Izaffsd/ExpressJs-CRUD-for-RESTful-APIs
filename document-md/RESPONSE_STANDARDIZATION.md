# Response Standardization Guide

## Problem Statement

Your API returns inconsistent response shapes, which will cause issues with:
1. Frontend Zod validation schemas
2. TypeScript type safety
3. Predictable error handling

## Current Problems Mapped

### Problem 1: CREATE endpoints return different shapes

**courses.controller.js (❌ Wrong):**
```javascript
const [result] = await db.query(insertQuery, values)
return response(201, result, 'Course created successfully', res)

// Returns raw DB result:
{
  "success": true,
  "payload": {
    "affectedRows": 1,
    "insertId": 5,
    "warningStatus": 0
  },
  "message": "Course created successfully",
  "statusCode": 201
}
```

**students.controller.js (✓ Better):**
```javascript
const dataResult = {
  dataRows: result.affectedRows,
  dataId: result.insertId
}
return response(201, dataResult, 'Student created successfully', res)

// Returns:
{
  "success": true,
  "payload": {
    "dataRows": 1,
    "dataId": 5
  },
  "message": "Student created successfully",
  "statusCode": 201
}
```

**Problem:** Frontend expects different shapes for same operation.

---

### Problem 2: GET endpoints return inconsistent field sets

**getStudentByMatricNo (❌ Limited fields):**
```sql
SELECT matric_no, student_name FROM student WHERE matric_no = ?
```

**getAllStudents (✓ All fields):**
```sql
SELECT * FROM student
```

**Problem:** Zod schema can't validate - shape is different.

---

### Problem 3: UPDATE endpoints return inconsistent data

**students.controller.js:**
```javascript
const dataResult = {
  dataRows: result.affectedRows,
  dataMessage: result.info  // ❌ Non-standard
}
return response(200, dataResult, 'Student updated successfully', res)
```

**Problem:** `dataMessage` is not a standard response field.

---

## Solution: Standardized Response Types

### Response Type 1: Single Resource (GET by ID)

```javascript
// Request:
GET /students/:studentId

// Response (200):
{
  "success": true,
  "payload": {
    "student_id": 1,
    "matric_no": "CS2024",
    "email": "student@example.com",
    "student_name": "John Doe",
    "course_id": 1,
    "address": "123 Main St",
    "gender": "M",
    "created_at": "2024-01-13T10:30:00Z"
  },
  "message": "Student retrieved successfully",
  "statusCode": 200,
  "errorCode": null
}

// Response (404):
{
  "success": false,
  "payload": null,
  "message": "Student not found",
  "statusCode": 404,
  "errorCode": "STUDENT_NOT_FOUND"
}
```

---

### Response Type 2: Multiple Resources (GET all)

```javascript
// Request:
GET /students

// Response (200):
{
  "success": true,
  "payload": [
    {
      "student_id": 1,
      "matric_no": "CS2024",
      "email": "student@example.com",
      "student_name": "John Doe",
      "course_id": 1
    },
    {
      "student_id": 2,
      "matric_no": "CS2025",
      "email": "student2@example.com",
      "student_name": "Jane Doe",
      "course_id": 1
    }
  ],
  "message": "Students retrieved successfully",
  "statusCode": 200,
  "metadata": {
    "count": 2,
    "total": 100,  // Total in DB
    "page": 1,
    "pageSize": 2,
    "hasMore": true
  }
}
```

---

### Response Type 3: CREATE (POST)

```javascript
// Request:
POST /students
{
  "matric_no": "CS2026",
  "email": "new@example.com",
  "student_name": "New Student",
  "course_id": 1,
  "no_kp": "991212345678",
  "address": "Address",
  "gender": "F"
}

// Response (201):
{
  "success": true,
  "payload": {
    "id": 3,                    // Only return essential fields
    "matric_no": "CS2026",
    "email": "new@example.com",
    "student_name": "New Student",
    "student_id": 3            // DB generated ID
  },
  "message": "Student created successfully",
  "statusCode": 201,
  "errorCode": null
}

// Response (400 - Validation):
{
  "success": false,
  "payload": null,
  "message": "Missing required fields",
  "statusCode": 400,
  "errorCode": "REQUIRED_ERROR",
  "metadata": {
    "missingFields": ["email", "student_name"]
  }
}

// Response (409 - Duplicate):
{
  "success": false,
  "payload": null,
  "message": "Email already exists",
  "statusCode": 409,
  "errorCode": "DUPLICATE_EMAIL",
  "metadata": {
    "field": "email",
    "value": "duplicate@example.com"
  }
}
```

---

### Response Type 4: UPDATE (PUT)

```javascript
// Request:
PUT /students
{
  "student_id": 1,
  "matric_no": "CS2024",
  "email": "updated@example.com",
  "student_name": "John Updated",
  "course_id": 1,
  "no_kp": "991212345678"
}

// Response (200):
{
  "success": true,
  "payload": {
    "affected": 1              // Number of rows updated
  },
  "message": "Student updated successfully",
  "statusCode": 200,
  "errorCode": null
}

// Response (404):
{
  "success": false,
  "payload": null,
  "message": "Student not found",
  "statusCode": 404,
  "errorCode": "STUDENT_NOT_FOUND"
}
```

---

### Response Type 5: DELETE

```javascript
// Request:
DELETE /students/:studentId

// Response (200):
{
  "success": true,
  "payload": {
    "deleted": 1              // Number of rows deleted
  },
  "message": "Student deleted successfully",
  "statusCode": 200,
  "errorCode": null
}

// Response (404):
{
  "success": false,
  "payload": null,
  "message": "Student not found",
  "statusCode": 404,
  "errorCode": "STUDENT_NOT_FOUND"
}
```

---

## Implementation Steps

### Step 1: Create Response Utilities

Create: `utils/responseMapper.js`

```javascript
/**
 * Map raw database results to standard response shapes
 * Prevents exposing DB internals to frontend
 */

export const mapStudent = (dbStudent) => ({
    student_id: dbStudent.student_id,
    matric_no: dbStudent.matric_no,
    email: dbStudent.email,
    student_name: dbStudent.student_name,
    course_id: dbStudent.course_id,
    address: dbStudent.address || null,
    gender: dbStudent.gender || null,
    created_at: dbStudent.created_at
})

export const mapStudents = (dbStudents) => dbStudents.map(mapStudent)

export const mapCourse = (dbCourse) => ({
    course_id: dbCourse.course_id,
    course_code: dbCourse.course_code,
    course_name: dbCourse.course_name,
    created_at: dbCourse.created_at
})

export const mapCourses = (dbCourses) => dbCourses.map(mapCourse)

/**
 * Response metadata for pagination, counts, etc
 */
export const createPaginationMetadata = (page, pageSize, total) => ({
    page: parseInt(page) || 1,
    pageSize: parseInt(pageSize) || 10,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasMore: page * pageSize < total
})

export const createCountMetadata = (count) => ({
    count
})
```

---

### Step 2: Update students.controller.js

```javascript
import { mapStudent, mapStudents } from '../utils/responseMapper.js'

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

        // Map raw DB result to standard shape
        const student = mapStudent(result[0])
        return response(200, student, 'Student retrieved successfully', res)
    } catch (error) {
        console.error('[GET STUDENT BY ID ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM student')
        
        // Map all results
        const mappedStudents = mapStudents(students)
        
        return response(200, mappedStudents, 'Students retrieved successfully', res, null, {
            count: students.length
        })
    } catch (error) {
        console.error('[GET ALL STUDENTS ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const createStudent = async (req, res) => {
    try {
        const { matric_no, no_kp, email, student_name, address, gender, course_id } = req.body

        // ... validation code ...

        const values = [matric_no, no_kp, email, student_name, address || null, gender || null, course_id]
        const [result] = await db.query(insertQuery, values)

        if (result.affectedRows !== 1) {
            return response(400, null, 'Student not created', res, 'STUDENT_NOT_CREATED')
        }

        // Return consistent create response
        const dataResult = {
            id: result.insertId,
            student_id: result.insertId,
            matric_no,
            email,
            student_name
        }

        return response(201, dataResult, 'Student created successfully', res)

    } catch (error) {
        // ... error handling ...
    }
}

export const updateStudent = async (req, res) => {
    try {
        // ... validation ...

        const [result] = await db.query(updateQuery, values)

        if (result.affectedRows === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }

        // Consistent update response
        const dataResult = {
            affected: result.affectedRows
        }

        return response(200, dataResult, 'Student updated successfully', res)

    } catch (error) {
        // ... error handling ...
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

        // Consistent delete response
        const dataResult = {
            deleted: result.affectedRows
        }

        return response(200, dataResult, 'Student deleted successfully', res)

    } catch (error) {
        console.error('[DELETE STUDENT ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

export const getStudentByMatricNo = async (req, res) => {
    try {
        const params_ndp = req.params.matricNo

        if (!validMatricNo(params_ndp)) {
            return response(400, null, 'Invalid Student Matric', res, 'INVALID_STUDENT_MATRIC')
        }

        // Get all fields, not just 2
        const [result] = await db.query(
            'SELECT * FROM student WHERE matric_no = ?',
            [params_ndp]
        )
        
        if (result.length === 0) {
            return response(404, null, 'Student not found', res, 'STUDENT_NOT_FOUND')
        }

        // Map result to consistent shape
        const student = mapStudent(result[0])
        return response(200, student, 'Student retrieved successfully', res)
    } catch (error) {
        console.error('[GET STUDENT BY MATRIC NO ERROR]', error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}
```

---

## Frontend TypeScript Types (Reference)

Now your frontend can have predictable types:

```typescript
// types/api.ts
export interface StudentResponse {
  student_id: number
  matric_no: string
  email: string
  student_name: string
  course_id: number
  address: string | null
  gender: string | null
  created_at: string
}

export interface CreateStudentPayload {
  id: number
  student_id: number
  matric_no: string
  email: string
  student_name: string
}

export interface ApiResponse<T> {
  success: boolean
  payload: T | null
  message: string
  statusCode: number
  errorCode?: string
  metadata?: Record<string, any>
}

// Usage in component:
const response = await api.get<ApiResponse<StudentResponse[]>>('/students')
const students: StudentResponse[] = response.data.payload
```

---

## Apply to Courses Controller Too

Same pattern for courses:

```javascript
// Create mapper
export const mapCourse = (dbCourse) => ({
    course_id: dbCourse.course_id,
    course_code: dbCourse.course_code,
    course_name: dbCourse.course_name,
    created_at: dbCourse.created_at
})

// Use in controller
const [result] = await db.query(insertQuery, values)
const course = {
    id: result.insertId,
    course_code,
    course_name
}
return response(201, course, 'Course created successfully', res)
```

---

## Summary

**Before:**
- Inconsistent response shapes
- DB internals exposed (RowDataPacket, affectedRows)
- Frontend can't validate reliably

**After:**
- Standardized response shapes per operation type
- Clean data only sent to frontend
- TypeScript/Zod validation works perfectly
- Easier to add features (pagination, filtering, etc.)

