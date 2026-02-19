# 📊 MONASH API - CODEBASE ANALYSIS

**Generated:** 2026-02-11  
**Version:** 1.0.0  
**Project:** Monash College Management System - Backend API

---

## 📁 FOLDER STRUCTURE

```
monash-api/
├── app.js                              # Express app configuration & middleware
├── server.js                           # Server entry point
├── package.json                        # Dependencies & scripts
├── logs/
│   └── error.log                      # Winston error logs (JSON format)
├── public/
│   └── index.html                     # Static files
└── src/
    ├── controllers/
    │   ├── students.controller.js      # Student business logic
    │   └── courses.controller.js       # Course business logic
    ├── db/
    │   ├── connection.js              # MySQL connection pool
    │   └── monash.sql                  # Database schema
    ├── middleware/
    │   ├── errorHandler.js             # Global error handler
    │   ├── transformRequest.middleware.js  # Request transformation (camelCase → snake_case)
    │   └── validateZod.js             # Zod validation middleware
    ├── routes/
    │   ├── index.js                    # Route aggregator
    │   ├── students.routes.js          # Student routes
    │   └── courses.routes.js           # Course routes
    └── utils/
        ├── caseTransform.js            # camelCase ↔ snake_case utilities
        ├── courseValidation.js         # Course Zod schemas
        ├── logger.js                   # Winston logger config
        ├── response.js                 # Standardized response helper
        └── studentValidation.js        # Student Zod schemas
```

---

## 🗄️ DATABASE SCHEMA (ERD)

### **Table: `courses`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `course_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique course identifier |
| `course_code` | VARCHAR(6) | UNIQUE, NOT NULL | Course code (e.g., "SE", "LAW") |
| `course_name` | VARCHAR(100) | NOT NULL | Full course name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `course_id`
- UNIQUE: `course_code`

---

### **Table: `student`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `student_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique student identifier |
| `student_number` | VARCHAR(10) | UNIQUE, NOT NULL | Matric number (e.g., "SE0804") |
| `mykad_number` | CHAR(12) | UNIQUE, NOT NULL | Malaysian IC number |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Student email |
| `student_name` | VARCHAR(100) | NOT NULL | Full student name |
| `address` | TEXT | NULL | Student address |
| `gender` | ENUM('Male','Female') | NULL | Gender |
| `course_id` | INT | NOT NULL, FK → courses.course_id | Foreign key to courses |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `student_id`
- UNIQUE: `student_number`, `mykad_number`, `email`
- FOREIGN KEY: `course_id` → `courses.course_id` (ON DELETE RESTRICT, ON UPDATE CASCADE)

---

### **ERD Relationship**

```
courses (1) ────< (many) student
   │                      │
   │                      │
course_id          course_id (FK)
```

**Business Rule:**
- One course can have many students
- Student must belong to one course
- Course deletion is RESTRICTED if students exist
- Course update CASCADES to students

---

## 📦 DEPENDENCIES & LIBRARIES

### **Production Dependencies**

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | Web framework |
| `mysql2` | ^3.16.0 | MySQL driver (promise-based) |
| `zod` | ^4.3.6 | Schema validation |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `dotenv` | ^17.2.3 | Environment variables |
| `morgan` | ^1.10.1 | HTTP request logger |
| `winston` | ^3.19.0 | Error logging |
| `camelcase-keys` | ^10.0.2 | Convert objects to camelCase (response transformation) |
| `snake-keys` | ^3.0.0 | Convert objects to snake_case (request transformation) |

### **Development Dependencies**

| Package | Version | Purpose |
|---------|---------|---------|
| `nodemon` | ^3.1.11 | Auto-restart on file changes |

---

## 🛣️ API ENDPOINTS

### **Base URL:** `http://localhost:4000/api`

---

### **Root Endpoint**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | API welcome message | ❌ |

**Response:**
```json
{
  "message": "SUCCESS - Welcome to the Monash API",
  "version": "1.0.0",
  "timestamp": "2026-02-11T10:00:00.000Z"
}
```

---

### **Student Endpoints**

| Method | Endpoint | Validation | Description |
|--------|----------|------------|-------------|
| GET | `/students` | ❌ | Get all students |
| GET | `/students/:student_id` | ✅ Params | Get student by ID |
| POST | `/students` | ✅ Body | Create new student |
| PUT | `/students` | ✅ Body | Update student |
| DELETE | `/students/:student_id` | ✅ Params | Delete student |

**Note:** Route parameters use `snake_case` (e.g., `:student_id`), but frontend can send `camelCase` - middleware handles conversion automatically.

---

### **Course Endpoints**

| Method | Endpoint | Validation | Description |
|--------|----------|------------|-------------|
| GET | `/courses` | ❌ | Get all courses |
| GET | `/courses/:course_code` | ✅ Params | Get course by code |
| POST | `/courses` | ✅ Body | Create new course |
| PUT | `/courses` | ✅ Body | Update course |
| DELETE | `/courses/:course_id` | ✅ Params | Delete course |

**Note:** Route parameters use `snake_case` (e.g., `:course_code`, `:course_id`), but frontend can send `camelCase` - middleware handles conversion automatically.

---

## 💻 CODE CONCEPTS & IMPLEMENTATION

### **1. Request/Response Transformation Architecture**

#### **Implementation Flow dengan Code**

```javascript
// ============================================
// 1. FRONTEND SENDS (camelCase)
// ============================================
// Frontend: POST /api/students
{
  studentNumber: "SE23001",
  studentName: "Ahmad Bin Abdullah",
  email: "ahmad@monash.edu"
}

// ============================================
// 2. TRANSFORM REQUEST MIDDLEWARE
// ============================================
// src/middleware/transformRequest.middleware.js
export const transformRequest = (req, res, next) => {
  // Transform body, params, query from camelCase → snake_case
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = toSnakeCase(req.body)  // Uses snake-keys library
  }
  if (req.params && Object.keys(req.params).length > 0) {
    req.params = toSnakeCase(req.params)
  }
  next()
}

// After middleware, req.body becomes:
{
  student_number: "SE23001",
  student_name: "Ahmad Bin Abdullah",
  email: "ahmad@monash.edu"
}

// ============================================
// 3. ZOD VALIDATION MIDDLEWARE
// ============================================
// src/middleware/validateZod.js
export const validateZod = (schema, source = 'body') => {
  return (request, res, next) => {
    const data = request[source]  // Get transformed snake_case data
    const result = schema.safeParse(data)  // Validate with Zod
    
    if (!result.success) {
      const firstIssue = result.error.issues[0]
      const fieldName = firstIssue.path[0] || 'field'
      const errorCode = `INVALID_${String(fieldName).toUpperCase()}_400`
      return response(res, 400, firstIssue.message, null, errorCode)
    }
    
    request[source] = result.data  // Replace with validated & transformed data
    next()  // Pass to controller
  }
}

// ============================================
// 4. CONTROLLER (uses snake_case)
// ============================================
// src/controllers/students.controller.js
export const createStudent = async (req, res, next) => {
  try {
    // req.body is already snake_case and validated
    const { student_number, student_name, email } = req.body
    
    // Auto-detect course_id from student_number prefix
    const prefix = extractStudentNumberPrefix(student_number)  // "SE23001" → "SE"
    
    // Query database (snake_case)
    const [courseResult] = await db.execute(
      'SELECT course_id FROM courses WHERE course_code = ?',
      [prefix]
    )
    
    const course_id = courseResult[0].course_id
    
    // Insert (snake_case)
    const [result] = await db.execute(
      'INSERT INTO student (student_number, student_name, email, course_id) VALUES (?, ?, ?, ?)',
      [student_number, student_name, email, course_id]
    )
    
    // Return response (will be converted to camelCase)
    return response(res, 201, 'Student created successfully', {
      student_id: result.insertId,
      student_number: student_number,
      course_id: course_id
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// 5. RESPONSE UTILITY (snake_case → camelCase)
// ============================================
// src/utils/response.js
import { toCamelCase } from './caseTransform.js'

export const response = (res, statusCode, message = "", data = null, errorCode = null) => {
  const success = statusCode < 400
  const resBody = { statusCode, success, message }
  
  if (success && data !== null) {
    // Transform data from snake_case → camelCase
    resBody.data = toCamelCase(data)  // Uses camelcase-keys library
  }
  
  return res.status(statusCode).json(resBody)
}

// Response sent to frontend (camelCase):
{
  "statusCode": 201,
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 123,
    "studentNumber": "SE23001",
    "courseId": 2
  }
}
```

#### **Case Transformation Utilities**

```javascript
// src/utils/caseTransform.js
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snake-keys'

// Convert object keys to camelCase (for responses)
export const toCamelCase = (data) => {
  if (!data) return data
  return camelcaseKeys(data, {
    deep: true,  // Transform nested objects & arrays
    exclude: [/^_/]  // Exclude keys starting with underscore
  })
}

// Convert object keys to snake_case (for requests)
export const toSnakeCase = (data) => {
  if (!data) return data
  return snakecaseKeys(data, {
    deep: true,  // Transform nested objects & arrays
    exclude: [/^_/]  // Exclude keys starting with underscore
  })
}

// Example transformations:
toSnakeCase({ studentId: 1, courseCode: "SE" })
// → { student_id: 1, course_code: "SE" }

toCamelCase({ student_id: 1, course_code: "SE" })
// → { studentId: 1, courseCode: "SE" }

// Deep transformation works on nested objects:
toSnakeCase({ 
  studentId: 1, 
  course: { courseCode: "SE", courseName: "Software Engineering" } 
})
// → { 
//      student_id: 1, 
//      course: { course_code: "SE", course_name: "Software Engineering" } 
//    }
```

---

### **7. Complete Request Flow dengan Code**

```javascript
// ============================================
// COMPLETE REQUEST FLOW: POST /api/students
// ============================================

// STEP 1: Frontend sends request (camelCase)
// POST /api/students
{
  "studentNumber": "SE23001",
  "studentName": "Ahmad Bin Abdullah",
  "email": "ahmad@monash.edu",
  "mykadNumber": "020304165432"
}

// STEP 2: Express receives request
// app.js
app.use(express.json())  // Parse JSON body
app.use('/api', routes)   // Route to /api

// STEP 3: Route aggregator applies transformation
// src/routes/index.js
router.use(transformRequest)  // Apply to all routes
router.use(studentsRoutes)

// STEP 4: Transform request (camelCase → snake_case)
// src/middleware/transformRequest.middleware.js
export const transformRequest = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = toSnakeCase(req.body)
  }
  next()
}

// req.body after transformation:
{
  "student_number": "SE23001",
  "student_name": "Ahmad Bin Abdullah",
  "email": "ahmad@monash.edu",
  "mykad_number": "020304165432"
}

// STEP 5: Route matches and applies validation
// src/routes/students.routes.js
router.post('/students', validateZod(createStudentSchema, 'body'), createStudent)

// STEP 6: Zod validation
// src/middleware/validateZod.js
export const validateZod = (schema, source = 'body') => {
  return (request, res, next) => {
    const data = request[source]  // Get snake_case data
    const result = schema.safeParse(data)  // Validate
    
    if (!result.success) {
      // Return validation error
      return response(res, 400, firstIssue.message, null, errorCode)
    }
    
    request[source] = result.data  // Validated & transformed data
    next()  // Continue to controller
  }
}

// STEP 7: Controller executes business logic
// src/controllers/students.controller.js
export const createStudent = async (req, res, next) => {
  try {
    // req.body is validated & snake_case
    const { student_number, student_name, email, mykad_number } = req.body
    
    // Business logic: Extract prefix
    const prefix = extractStudentNumberPrefix(student_number)  // "SE"
    
    // Database query
    const [courseResult] = await db.execute(
      'SELECT course_id FROM courses WHERE course_code = ?',
      [prefix]
    )
    
    const course_id = courseResult[0].course_id
    
    // Insert
    const [result] = await db.execute(
      'INSERT INTO student (...) VALUES (...)',
      [student_number, mykad_number, email, student_name, course_id]
    )
    
    // Return response (will be converted to camelCase)
    return response(res, 201, 'Student created successfully', {
      student_id: result.insertId,
      student_number: student_number,
      course_id: course_id
    })
  } catch (error) {
    next(error)  // Pass to error handler
  }
}

// STEP 8: Response utility converts to camelCase
// src/utils/response.js
export const response = (res, statusCode, message, data, errorCode) => {
  const resBody = { statusCode, success: statusCode < 400, message }
  
  if (data !== null) {
    resBody.data = toCamelCase(data)  // snake_case → camelCase
  }
  
  return res.status(statusCode).json(resBody)
}

// STEP 9: Response sent to frontend (camelCase)
{
  "statusCode": 201,
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 123,
    "studentNumber": "SE23001",
    "courseId": 2
  }
}
```

---

## 📝 API REQUEST/RESPONSE EXAMPLES (Key Endpoints Only)

### **1. GET /api/students**

**Request:**
```http
GET /api/students
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Students Retrieved successfully",
  "data": [
    {
      "studentId": 1,
      "studentNumber": "SE0804",
      "mykadNumber": "020304165432",
      "email": "siti.se@monash.edu",
      "studentName": "Siti Aminah",
      "address": "Selangor",
      "gender": "Female",
      "courseId": 2,
      "createdAt": "2025-12-17T09:44:31.000Z",
      "updatedAt": "2025-12-30T09:38:51.000Z",
      "courseCode": "SE",
      "courseName": "Bachelor of Software Engineering"
    }
  ]
}
```

**Note:** Response keys are automatically converted to `camelCase` by the response utility.

---

### **2. GET /api/students/:student_id**

**Request:**
```http
GET /api/students/2
```

**Note:** Frontend can send `GET /api/students/2` or use `studentId` in query params - middleware handles conversion.

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "studentId": 2,
    "studentNumber": "SE0804",
    "mykadNumber": "020304165432",
    "email": "siti.se@monash.edu",
    "studentName": "Siti Aminah",
    "address": "Selangor",
    "gender": "Female",
    "courseId": 2,
    "createdAt": "2025-12-17T09:44:31.000Z",
    "updatedAt": "2025-12-30T09:38:51.000Z",
    "courseCode": "SE",
    "courseName": "Bachelor of Software Engineering"
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "ID must be a number",
  "errorCode": "INVALID_STUDENT_ID_400",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Student does not exist",
  "errorCode": "STUDENT_NOT_FOUND_404",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

---

### **3. POST /api/students**

**Request:**
```http
POST /api/students
Content-Type: application/json

{
  "studentNumber": "SE23001",
  "mykadNumber": "020304165432",
  "email": "ahmad@monash.edu",
  "studentName": "Ahmad Bin Abdullah",
  "address": "Selangor",
  "gender": "Male"
}
```

**Note:** 
- Frontend sends `camelCase` (e.g., `studentNumber`, `studentName`)
- Middleware converts to `snake_case` (e.g., `student_number`, `student_name`) before validation
- `course_id` is **auto-detected** from `student_number` prefix (e.g., "SE23001" → prefix "SE" → lookup course_code="SE" → get course_id)

**Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentId": 123,
    "studentNumber": "SE23001",
    "courseId": 2,
    "courseCode": "SE"
  }
}
```

**Error Response (400) - Validation:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid student number format (e.g., LAW0504, SE03001)",
  "errorCode": "INVALID_STUDENT_NUMBER_400",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

**Error Response (404) - Course Not Found:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Course does not exist",
  "errorCode": "COURSE_NOT_FOUND_404",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

**Error Response (409) - Duplicate:**
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Student Already Exists",
  "errorCode": "DUPLICATE_STUDENT_409",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

---

### **4. PUT /api/students**

**Request:** `PUT /api/students` dengan body `camelCase` → middleware converts → controller uses `snake_case`  
**Response:** Success dengan `updated: true` dan `studentId`

### **5. DELETE /api/students/:student_id**

**Request:** `DELETE /api/students/2`  
**Response:** Success message, no data

### **6-10. Course Endpoints**

Similar patterns to student endpoints:
- GET all: No validation
- GET by code: Validate params
- POST: Validate body, return created course
- PUT: Validate body, return updated course
- DELETE: Validate params, handle foreign key constraint errors

---

## 🔒 VALIDATION RULES & CODE IMPLEMENTATION

### **2. Zod Validation Schema Patterns**

#### **Student Validation Schema Implementation**

```javascript
// src/utils/studentValidation.js
import { z } from 'zod'

// Helper function to extract prefix from student_number
export const extractStudentNumberPrefix = (studentNumber) => {
  const match = studentNumber.match(/^([A-Z]{2,4})/)
  return match ? match[1] : null
}

// Reusable validation schemas (snake_case field names)
const idParam = z.string()
  .regex(/^\d+$/, 'ID must be a number')
  .transform(Number)  // Auto-convert string to number

const studentNumber = z.string()
  .min(1, 'Student number is required')
  .transform(val => val.toUpperCase().trim())  // Auto-transform
  .refine(val => /^[A-Z]{2,4}[0-9]{4,5}$/.test(val), {
    message: 'Invalid student number format (e.g., LAW0504, SE03001)'
  })

const myKadNumber = z.string()
  .length(12, 'MyKad number must be exactly 12 digits')
  .regex(/^\d{12}$/, 'MyKad number must contain only digits')
  .refine((val) => {
    // Custom validation: Check YYMMDD format
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
  .toLowerCase()  // Auto-transform
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

// Export schemas for different endpoints
export const getStudentByIdSchema = z.object({
  student_id: idParam  // Note: snake_case
})

export const createStudentSchema = z.object({
  student_number: studentNumber,
  mykad_number: myKadNumber,
  email: email,
  student_name: studentName,
  address: z.string().max(255).trim().optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional().nullable()
  // course_id removed - auto-detected from student_number prefix
})

export const updateStudentSchema = z.object({
  student_id: courseId,
  mykad_number: myKadNumber,
  student_name: studentName,
  address: z.string().max(255).trim().optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional().nullable(),
  course_id: courseId
})

export const deleteStudentSchema = z.object({
  student_id: idParam
})
```

#### **Course Validation Schema Implementation**

```javascript
// src/utils/courseValidation.js
import { z } from 'zod'

const idParam = z.string()
  .regex(/^\d+$/, 'ID must be a number')
  .transform(Number)

const courseCode = z.string()
  .min(1, 'Course code is required')
  .transform(code => code.toUpperCase().trim())  // Auto-transform
  .refine(code => /^[A-Z]{2,4}$/.test(code), {
    message: 'Invalid course code format (2-4 uppercase letters, e.g., SE, LAW)'
  })

const courseName = z.string()
  .min(1, 'Course name is required')
  .max(100, 'Course name must not exceed 100 characters')
  .trim()

const courseId = z.number()
  .int('Course ID must be a number')

export const getCourseByCodeSchema = z.object({
  course_code: z.string()  // Note: snake_case
    .min(1, 'Course code is required')
    .transform(codeChars => codeChars.toUpperCase().trim())
    .refine(codeChars => /^[A-Z]{2,4}$/.test(codeChars), {
      message: 'Invalid course code format'
    })
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

export const deleteCourseSchema = z.object({
  course_id: idParam
})
```

#### **Key Validation Concepts**

1. **Type Transformation:**
   ```javascript
   // String param → Number (for IDs)
   z.string().regex(/^\d+$/).transform(Number)
   // "123" → 123
   ```

2. **Auto-Transformation:**
   ```javascript
   // Auto uppercase & trim
   z.string().transform(val => val.toUpperCase().trim())
   // "  se  " → "SE"
   ```

3. **Custom Refinement:**
   ```javascript
   // Custom validation logic
   .refine((val) => {
     // Your custom validation logic
     return isValid(val)
   }, {
     message: 'Custom error message'
   })
   ```

4. **Optional & Nullable:**
   ```javascript
   z.string().optional().nullable()
   // Allows: undefined, null, or string
   ```

---

### **3. Controller Pattern Implementation**

#### **Student Controller Pattern**

```javascript
// src/controllers/students.controller.js
import db from '../db/connection.js'
import { response } from '../utils/response.js'
import { extractStudentNumberPrefix } from '../utils/studentValidation.js'

// Pattern: getAll - No validation needed
export const getAllStudents = async (req, res, next) => {
  try {
    // Direct database query with JOIN
    const query = `
      SELECT
        s.*,
        c.course_id,
        c.course_code,
        c.course_name
      FROM student s
      LEFT JOIN courses c USING (course_id)
    `
    const [students] = await db.execute(query)
    
    // Response utility auto-converts to camelCase
    return response(res, 200, 'Students Retrieved successfully', students)
  } catch (error) {
    console.error('[GET ALL STUDENTS ERROR]', error)
    next(error)  // Pass to error handler
  }
}

// Pattern: getById - Params validation
export const getStudentById = async (req, res, next) => {
  try {
    // req.params already validated & transformed to snake_case
    const student_id = req.params.student_id
    
    const query = `
      SELECT s.*, c.course_id, c.course_code, c.course_name
      FROM student s
      LEFT JOIN courses c USING (course_id)
      WHERE s.student_id = ?
    `
    const [result] = await db.execute(query, [student_id])
    
    if (result.length === 0) {
      return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
    }
    
    return response(res, 200, 'Student retrieved successfully', result[0])
  } catch (error) {
    console.error('[GET STUDENT BY ID ERROR]', error)
    next(error)
  }
}

// Pattern: create - Business logic with auto-detection
export const createStudent = async (req, res, next) => {
  try {
    // req.body already validated & transformed to snake_case
    const { student_number, mykad_number, email, student_name, address, gender } = req.body
    
    // Business Logic: Auto-detect course_id from student_number prefix
    const prefix = extractStudentNumberPrefix(student_number)  // "SE23001" → "SE"
    
    // Query to get course_id
    const [courseResult] = await db.execute(
      'SELECT course_id FROM courses WHERE course_code = ?',
      [prefix]
    )
    
    if (courseResult.length === 0) {
      return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
    }
    
    const course_id = courseResult[0].course_id
    
    // Insert with prepared statement
    const insertQuery = `
      INSERT INTO student 
      (student_number, mykad_number, email, student_name, address, gender, course_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      student_number,
      mykad_number,
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
    
    return response(res, 201, 'Student created successfully', {
      student_id: result.insertId,
      student_number: student_number,
      course_id: course_id,
      course_code: prefix
    })
  } catch (error) {
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return response(res, 409, 'Student Already Exists', null, 'DUPLICATE_STUDENT_409')
    }
    console.error('[CREATE STUDENT ERROR]', error)
    next(error)  // Pass to global error handler
  }
}

// Pattern: update - Check existence before update
export const updateStudent = async (req, res, next) => {
  try {
    const { student_id, mykad_number, student_name, address, gender, course_id } = req.body
    
    // Validate course exists
    const [courseExists] = await db.execute(
      'SELECT 1 FROM courses WHERE course_id = ?',
      [course_id]
    )
    
    if (courseExists.length === 0) {
      return response(res, 404, 'Course does not exist', null, 'COURSE_NOT_FOUND_404')
    }
    
    // Update with prepared statement
    const updateQuery = `
      UPDATE student 
      SET mykad_number = ?, student_name = ?, address = ?, gender = ?, course_id = ? 
      WHERE student_id = ?
    `
    const values = [mykad_number, student_name, address || null, gender || null, course_id, student_id]
    const [result] = await db.execute(updateQuery, values)
    
    if (result.affectedRows === 0) {
      return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
    }
    
    return response(res, 200, 'Student updated successfully', {
      updated: result.affectedRows > 0,
      student_id: student_id
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return response(res, 409, 'Student already exists', null, 'DUPLICATE_STUDENT_409')
    }
    console.error('[UPDATE STUDENT ERROR]', error)
    next(error)
  }
}

// Pattern: delete - Check affected rows
export const deleteStudent = async (req, res, next) => {
  try {
    const student_id = req.params.student_id
    
    const [result] = await db.execute(
      'DELETE FROM student WHERE student_id = ?',
      [student_id]
    )
    
    if (result.affectedRows === 0) {
      return response(res, 404, 'Student does not exist', null, 'STUDENT_NOT_FOUND_404')
    }
    
    return response(res, 200, 'Student deleted successfully', null)
  } catch (error) {
    console.error('[DELETE STUDENT ERROR]', error)
    next(error)
  }
}
```

#### **Controller Pattern Summary**

1. **Error Handling Pattern:**
   ```javascript
   try {
     // Business logic
   } catch (error) {
     // Handle specific errors
     if (error.code === 'ER_DUP_ENTRY') {
       return response(res, 409, 'Duplicate entry', null, 'DUPLICATE_409')
     }
     // Pass to global error handler
     next(error)
   }
   ```

2. **Database Query Pattern:**
   ```javascript
   // Prepared statements (SQL injection protection)
   const [result] = await db.execute('SELECT * FROM table WHERE id = ?', [id])
   ```

3. **Existence Check Pattern:**
   ```javascript
   if (result.length === 0) {
     return response(res, 404, 'Not found', null, 'NOT_FOUND_404')
   }
   ```

4. **Affected Rows Check Pattern:**
   ```javascript
   if (result.affectedRows === 0) {
     return response(res, 404, 'Not found', null, 'NOT_FOUND_404')
   }
   ```

---

### **4. Route Configuration Pattern**

```javascript
// src/routes/students.routes.js
import express from 'express'
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/students.controller.js'
import { validateZod } from '../middleware/validateZod.js'
import { getStudentByIdSchema, createStudentSchema, updateStudentSchema, deleteStudentSchema } from '../utils/studentValidation.js'

const router = express.Router()

// Pattern: GET all - No validation
router.get('/students', getAllStudents)

// Pattern: GET by ID - Validate params
router.get('/students/:student_id', validateZod(getStudentByIdSchema, 'params'), getStudentById)

// Pattern: POST - Validate body
router.post('/students', validateZod(createStudentSchema, 'body'), createStudent)

// Pattern: PUT - Validate body
router.put('/students', validateZod(updateStudentSchema, 'body'), updateStudent)

// Pattern: DELETE - Validate params
router.delete('/students/:student_id', validateZod(deleteStudentSchema, 'params'), deleteStudent)

export default router
```

```javascript
// src/routes/index.js
import express from 'express'
import studentsRoutes from './students.routes.js'
import coursesRoutes from './courses.routes.js'
import { transformRequest } from '../middleware/transformRequest.middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'SUCCESS - Welcome to the Monash API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Apply transformation middleware to ALL routes
// This converts camelCase → snake_case BEFORE validation
router.use(transformRequest)

// Mount route modules
router.use(studentsRoutes)
router.use(coursesRoutes)

export default router
```

---

### **5. Error Handling Pattern**

```javascript
// src/middleware/errorHandler.js
import { response } from '../utils/response.js'
import logger from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR_500'

  // Always log full error details
  logger.error({
    message: err.message || 'Unknown error',
    errorCode,
    statusCode,
    stack: err.stack,
    // Database errors
    code: err.code,
    errno: err.errno,
    sql: err.sql || err.sqlMessage,
    sqlState: err.sqlState,
    // Request context
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  })

  // Handle specific error codes
  if (errorCode === 'RESOURCE_NOT_FOUND_404') {
    return response(res, 404, err.message, null, errorCode)
  }

  // Generic error response
  return response(
    res,
    statusCode,
    'Internal Server Error',
    null,
    'INTERNAL_SERVER_ERROR_500'
  )
}
```

---

### **6. Database Connection Pattern**

```javascript
// src/db/connection.js
import mysql from 'mysql2/promise'

// Connection pool configuration
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monash',
  connectionLimit: 10,    // Max 10 concurrent connections
  queueLimit: 50,         // Max 50 queued requests
})

// Test connection on startup
export const connectDB = async () => {
  try {
    const conn = await db.getConnection()
    await conn.ping()
    conn.release()
    console.log("MySQL database connected successfully")
  } catch (err) {
    console.error("MySQL connection error:", err)
    process.exit(1)
  }
}

export default db
```

**Connection Pool Benefits:**
- Reuses connections (better performance)
- Handles concurrent requests
- Automatic connection management
- Queue management for high load

---

## 📊 API RESPONSE STANDARD

### **Success Response Format**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Note:** All `data` keys are automatically converted to `camelCase` by the response utility.

### **Error Response Format**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE_400",
  "timestamp": "2026-02-11T10:00:00.000Z",
  "errors": []
}
```

### **HTTP Status Codes**

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | GET, PUT, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Validation errors |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry, referenced resource |
| 500 | Internal Server Error | Server errors |

---

## 🏗️ ARCHITECTURE PATTERNS & MIDDLEWARE EXECUTION ORDER

### **1. Middleware Execution Order**

```javascript
// app.js - Middleware stack (executes in order)
app.use(morgan('dev'))                    // 1. Logging
app.use(cors({...}))                      // 2. CORS
app.use(express.json())                   // 3. Parse JSON body
app.use('/api', routes)                   // 4. Route to /api

// src/routes/index.js
router.use(transformRequest)              // 5. Transform camelCase → snake_case
router.use(studentsRoutes)                // 6. Route to students

// src/routes/students.routes.js
router.post('/students', 
  validateZod(createStudentSchema, 'body'), // 7. Validate with Zod
  createStudent                            // 8. Controller
)

// If error occurs:
app.use(errorHandler)                     // 9. Global error handler (LAST)
```

### **2. Request Processing Pipeline**

```javascript
// Complete pipeline dengan code examples:

// ============================================
// PHASE 1: REQUEST RECEPTION
// ============================================
// app.js
app.use(express.json())  // Parse JSON → req.body = { studentNumber: "SE23001" }

// ============================================
// PHASE 2: TRANSFORMATION
// ============================================
// src/routes/index.js
router.use(transformRequest)  
// req.body = { student_number: "SE23001" }  (camelCase → snake_case)

// ============================================
// PHASE 3: VALIDATION
// ============================================
// src/routes/students.routes.js
router.post('/students', validateZod(createStudentSchema, 'body'), ...)
// Zod validates snake_case data
// If invalid → return 400 error
// If valid → req.body = validated & transformed data

// ============================================
// PHASE 4: BUSINESS LOGIC
// ============================================
// src/controllers/students.controller.js
export const createStudent = async (req, res, next) => {
  // req.body is validated & snake_case
  // Execute business logic
  // Query database
  // Return response
}

// ============================================
// PHASE 5: RESPONSE TRANSFORMATION
// ============================================
// src/utils/response.js
export const response = (res, statusCode, message, data, errorCode) => {
  // Convert data from snake_case → camelCase
  resBody.data = toCamelCase(data)
  return res.status(statusCode).json(resBody)
}

// ============================================
// PHASE 6: ERROR HANDLING (if error occurs)
// ============================================
// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // Log error
  // Return standardized error response
}
```

### **3. Separation of Concerns**

```javascript
// ============================================
// ROUTES: Route definitions only
// ============================================
// src/routes/students.routes.js
router.post('/students', validateZod(createStudentSchema, 'body'), createStudent)
// ✅ Defines route
// ✅ Applies middleware
// ❌ No business logic
// ❌ No validation logic

// ============================================
// MIDDLEWARE: Request transformation & validation
// ============================================
// src/middleware/transformRequest.middleware.js
export const transformRequest = (req, res, next) => {
  req.body = toSnakeCase(req.body)  // Transform only
  next()
}

// src/middleware/validateZod.js
export const validateZod = (schema, source) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])  // Validate only
    if (!result.success) return response(res, 400, ...)
    req[source] = result.data
    next()
  }
}
// ✅ Transforms/validates request
// ❌ No business logic
// ❌ No database queries

// ============================================
// CONTROLLERS: Business logic & database
// ============================================
// src/controllers/students.controller.js
export const createStudent = async (req, res, next) => {
  // ✅ Business logic (auto-detect course)
  // ✅ Database queries
  // ✅ Error handling
  // ❌ No validation (already done)
  // ❌ No transformation (already done)
}

// ============================================
// UTILS: Reusable helpers
// ============================================
// src/utils/response.js - Standardized responses
// src/utils/caseTransform.js - Case conversion
// src/utils/studentValidation.js - Validation schemas
// src/utils/logger.js - Logging
```

### **4. Validation Strategy dengan Code**

```javascript
// ============================================
// CENTRALIZED VALIDATION SCHEMAS
// ============================================
// src/utils/studentValidation.js
export const createStudentSchema = z.object({
  student_number: studentNumber,  // Reusable schema
  mykad_number: myKadNumber,
  email: email,
  // ...
})

// ============================================
// GENERIC VALIDATION MIDDLEWARE
// ============================================
// src/middleware/validateZod.js
export const validateZod = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])
    // Works with ANY Zod schema
    // Works with body, params, or query
  }
}

// ============================================
// USAGE IN ROUTES
// ============================================
// src/routes/students.routes.js
router.post('/students', 
  validateZod(createStudentSchema, 'body'),  // Reusable middleware
  createStudent
)

router.get('/students/:student_id',
  validateZod(getStudentByIdSchema, 'params'),  // Same middleware, different schema
  getStudentById
)
```

### **5. Error Handling Pattern**

```javascript
// ============================================
// CONTROLLER ERROR HANDLING
// ============================================
export const createStudent = async (req, res, next) => {
  try {
    // Business logic
  } catch (error) {
    // Handle specific errors
    if (error.code === 'ER_DUP_ENTRY') {
      return response(res, 409, 'Duplicate', null, 'DUPLICATE_409')
    }
    // Pass to global handler
    next(error)
  }
}

// ============================================
// GLOBAL ERROR HANDLER (LAST MIDDLEWARE)
// ============================================
// app.js
app.use(errorHandler)  // Must be LAST

// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // Log error (always)
  logger.error({...})
  
  // Return standardized response
  return response(res, statusCode, message, null, errorCode)
}
```

### **6. Database Query Pattern**

```javascript
// ============================================
// CONNECTION POOL
// ============================================
// src/db/connection.js
const db = mysql.createPool({
  connectionLimit: 10,  // Max concurrent connections
  queueLimit: 50        // Max queued requests
})

// ============================================
// PREPARED STATEMENTS (SQL Injection Protection)
// ============================================
// ✅ Safe: Prepared statement
const [result] = await db.execute(
  'SELECT * FROM student WHERE student_id = ?',
  [student_id]  // Parameterized
)

// ❌ Unsafe: String concatenation
const query = `SELECT * FROM student WHERE student_id = ${student_id}`  // DON'T DO THIS

// ============================================
// TRANSACTION PATTERN (if needed)
// ============================================
const connection = await db.getConnection()
try {
  await connection.beginTransaction()
  
  await connection.execute('INSERT INTO student ...', [...])
  await connection.execute('UPDATE courses ...', [...])
  
  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  connection.release()
}
```

---

## 🔑 KEY FEATURES

### **1. Auto Course Detection**
- Student number prefix automatically maps to course
- No manual course selection needed
- Example: "SE23001" → course_code="SE" → course_id auto-assigned

### **2. Zod Validation**
- Schema-based validation
- Type coercion (string → number)
- Auto transformation (uppercase, lowercase, trim)
- Centralized validation rules

### **3. Database Connection Pool**
- MySQL connection pooling (10 connections, 50 queue limit)
- Promise-based queries (`mysql2/promise`)
- Prepared statements (SQL injection protection)

### **4. Logging**
- Winston logger for errors
- JSON format in file
- Simple format in console (dev only)
- Full error context logged

### **5. Automatic Case Transformation**
- **Frontend:** Uses `camelCase` (e.g., `studentId`, `courseCode`)
- **Backend:** Uses `snake_case` (e.g., `student_id`, `course_code`)
- **Automatic Conversion:**
  - Request middleware converts `camelCase` → `snake_case` before validation
  - Response utility converts `snake_case` → `camelCase` before sending to frontend
- **Benefits:**
  - Frontend developers work with familiar `camelCase`
  - Backend maintains database convention (`snake_case`)
  - No manual conversion needed in controllers or routes

---

## 📋 ERROR CODES REFERENCE

### **Student Errors**

| Error Code | Status | Description |
|------------|--------|-------------|
| `INVALID_STUDENT_ID_400` | 400 | Invalid student ID format |
| `INVALID_STUDENT_NUMBER_400` | 400 | Invalid student number format |
| `INVALID_MYKAD_NUMBER_400` | 400 | Invalid MyKad format |
| `INVALID_EMAIL_400` | 400 | Invalid email format |
| `STUDENT_NOT_FOUND_404` | 404 | Student does not exist |
| `COURSE_NOT_FOUND_404` | 404 | Course not found for prefix |
| `DUPLICATE_STUDENT_409` | 409 | Student already exists |
| `STUDENT_NOT_CREATED_400` | 400 | Insert failed |

### **Course Errors**

| Error Code | Status | Description |
|------------|--------|-------------|
| `INVALID_COURSE_ID_400` | 400 | Invalid course ID format |
| `INVALID_COURSE_CODE_400` | 400 | Invalid course code format |
| `COURSE_NOT_FOUND_404` | 404 | Course does not exist |
| `DUPLICATE_COURSE_409` | 409 | Course already exists |
| `COURSE_REFERENCED_BY_STUDENT_409` | 409 | Cannot delete (students exist) |

### **General Errors**

| Error Code | Status | Description |
|------------|--------|-------------|
| `RESOURCE_NOT_FOUND_404` | 404 | Route not found |
| `INTERNAL_SERVER_ERROR_500` | 500 | Server error |

---

## 🚀 ENVIRONMENT VARIABLES

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=monash
```

---

## 📝 NOTES

1. **Database Naming:** snake_case (e.g., `student_id`, `course_id`)
2. **API Naming:** 
   - **Route Parameters:** snake_case (e.g., `:student_id`, `:course_code`)
   - **Request Body:** Frontend sends camelCase, middleware converts to snake_case
   - **Response Body:** Backend uses snake_case, response utility converts to camelCase
3. **Validation:** All endpoints use Zod validation (except GET all)
   - Validation schemas expect snake_case field names
   - Frontend can send camelCase - middleware handles conversion
4. **Auto Course Assignment:** Student number prefix determines course
5. **Foreign Key:** Course deletion restricted if students exist
6. **Logging:** Errors logged to `logs/error.log` (JSON format)
7. **Case Transformation:**
   - Request: `transformRequest` middleware converts camelCase → snake_case
   - Response: `response()` utility converts snake_case → camelCase
   - Deep transformation: Nested objects and arrays are also transformed

---

**Last Updated:** 2026-02-11  
**Maintained By:** Backend Team

