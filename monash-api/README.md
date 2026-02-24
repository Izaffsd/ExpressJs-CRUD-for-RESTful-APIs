# 🎓 Monash College Management System API

A RESTful API built with Node.js, Express.js, and MySQL for managing students and courses in a college management system. This API demonstrates professional backend development practices including validation, error handling, pagination, and clean architecture.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Code Concepts](#code-concepts)
- [Project Structure](#project-structure)
- [Common Patterns](#common-patterns)

---

## 🎯 Overview

This API provides CRUD operations for:
- **Students**: Manage student records with auto-detection of course from student number
- **Courses**: Manage course information

### Key Features

- ✅ RESTful API design
- ✅ Request/Response transformation (camelCase ↔ snake_case)
- ✅ Zod schema validation
- ✅ Pagination support
- ✅ Centralized error handling
- ✅ MySQL database with connection pooling
- ✅ Winston logging
- ✅ CORS enabled

---

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: MySQL 8.x
- **Driver**:  mysql2 (Promise API)
- **Validation**: Zod 4.x
- **Logging**: Winston
- **Other**: dotenv, morgan, cors

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **Driver**:  mysql2 (Promise API)
- **npm** or **yarn**
- Basic knowledge of:
  - JavaScript (ES6+)
  - REST APIs
  - SQL
  - HTTP methods

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd monash-api/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=monash
```

### 4. Set Up Database

See [Database Setup](#database-setup) section below.

### 5. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The Client Side will be available at `http://localhost:4000`

### 6. Test the API

Open your browser and visit:
- **API Base**: `http://localhost:4000/api`
- **Frontend Demo**: `http://localhost:4000` (serves `public/index.html`)

---
## 🗄 Architecture Flow

🔄 Request Lifecycle

Client → Route → Transform → Validation → Controller → Service → Database → Response → Client

Route          →  define endpoints & attach middleware
Transform      →  camelCase → snake_case
Validation     →  Zod validates incoming request data
Controller     →  receives req, calls service, returns response
Service        →  business logic, DB queries, throws AppError
Database       →  executes query
Response       →  formats & converts snake_case → camelCase
Error Handler  →  catches AppError, returns error response
---

## 🗄 Database Setup

### Option 1: Import SQL File (Recommended)

1. Create a MySQL database:
```sql
CREATE DATABASE monash;
```

2. Import the SQL file:
```bash
mysql -u root -p monash < src/db/monash.sql
```

Or use phpMyAdmin/MySQL Workbench to import `src/db/monash.sql`

### Option 2: Manual Setup

Run the SQL commands from `src/db/monash.sql` in your MySQL client.

### Database Schema

**courses** table:
- `course_id` (PK, AUTO_INCREMENT)
- `course_code` (UNIQUE, VARCHAR(6)) - e.g., "SE", "LAW"
- `course_name` (VARCHAR(100))
- `created_at`, `updated_at` (TIMESTAMP)

**students** table:
- `student_id` (PK, AUTO_INCREMENT)
- `student_number` (UNIQUE, VARCHAR(10)) - e.g., "SE23001"
- `mykad_number` (UNIQUE, CHAR(12)) - Malaysian IC number
- `email` (UNIQUE, VARCHAR(255))
- `student_name` (VARCHAR(100))
- `address` (TEXT, nullable)
- `gender` (ENUM: 'Male', 'Female', nullable)
- `course_id` (FK → courses.course_id)
- `created_at`, `updated_at` (TIMESTAMP)

---

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `4000` | No |
| `NODE_ENV` | Environment (development/uat/production) | `development` | No |
| `DB_HOST` | MySQL host | - | Yes |
| `DB_USER` | MySQL username | - | Yes |
| `DB_PASSWORD` | MySQL password | `""` | No |
| `DB_NAME` | MySQL database name | - | Yes |

---

## 📚 API Documentation

### Base URL

```
http://localhost:4000/api
```

### Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Students Retrieved successfully",
  "data": [...],
  "pagination": { ... }  // Only for paginated endpoints
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid student number format",
  "errorCode": "INVALID_STUDENT_NUMBER_400",
  "timestamp": "2026-02-20T10:30:00.000Z",
  "errors": []
}
```

### Important Notes

1. **Naming Convention**:
   - Database uses `snake_case` (e.g., `student_id`, `course_code`)
   - API requests/responses use `camelCase` (e.g., `studentId`, `courseCode`)
   - The API automatically transforms between these formats

2. **Student Number Auto-Detection**:
   - When creating/updating a student, the system automatically detects the course from the `student_number` prefix
   - Example: `student_number: "SE23001"` → automatically assigns `course_id` for course code "SE"
   - You don't need to send `course_id` in the request body

---

## 👥 Students Endpoints

### 1. Get All Students (with Pagination)

**GET** `/students`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/students?page=1&limit=10')
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Students Retrieved successfully",
  "data": [
    {
      "studentId": 1,
      "studentNumber": "SE0001",
      "mykadNumber": "020304101234",
      "email": "ahmad.se@monash.edu",
      "studentName": "Ahmad Bin Abdullah",
      "address": "Taman Selangor",
      "gender": "Male",
      "courseId": 1,
      "courseCode": "SE",
      "courseName": "Bachelor of Software Engineering",
      "createdAt": "2025-02-01T09:00:00.000Z",
      "updatedAt": "2026-02-20T06:53:47.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 17,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. Get Student by ID

**GET** `/students/:student_id`

**URL Parameters:**
- `student_id` (required): Student ID (number)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/students/1')
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "studentId": 1,
    "studentNumber": "SE0001",
    "mykadNumber": "020304101234",
    "email": "ahmad.se@monash.edu",
    "studentName": "Ahmad Bin Abdullah",
    "address": "Taman Selangor",
    "gender": "Male",
    "courseId": 1,
    "courseCode": "SE",
    "courseName": "Bachelor of Software Engineering",
    "createdAt": "2025-02-01T09:00:00.000Z",
    "updatedAt": "2026-02-20T06:53:47.000Z"
  }
}
```

---

### 3. Create Student

**POST** `/students`

**Request Body:**
```json
{
  "studentName": "Ahmad Bin Abdullah",
  "studentNumber": "SE23001",
  "email": "ahmad@monash.edu",
  "mykadNumber": "020304101234",
  "address": "Selangor",
  "gender": "Male"
}
```

**Field Rules:**
- `studentName`: Required, max 100 characters
- `studentNumber`: Required, format: 2-4 uppercase letters + 4-5 digits (e.g., "SE23001", "LAW0504")
- `email`: Required, valid email format
- `mykadNumber`: Required, exactly 12 digits (Malaysian IC format: YYMMDDxxxxxx)
- `address`: Optional, max 255 characters
- `gender`: Optional, "Male" or "Female"

**Note**: The `course_id` is automatically detected from `student_number` prefix (e.g., "SE" → Software Engineering course)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentName: "Ahmad Bin Abdullah",
    studentNumber: "SE23001",
    email: "ahmad@monash.edu",
    mykadNumber: "020304101234",
    address: "Selangor",
    gender: "Male"
  })
})
```

**Example Response:**
```json
{
    "statusCode": 201,
    "success": true,
    "message": "Student created successfully",
    "data": {
        "studentId": 86,
        "studentNumber": "SE1212",
        "mykadNumber": "010101110847",
        "email": "test@gmail.com",
        "studentName": "test",
        "address": null,
        "gender": null,
        "courseId": 2,
        "courseCode": "SE",
        "courseName": "Bachelor of Software Engineering",
        "createdAt": "2026-02-21T08:17:00.000Z",
        "updatedAt": "2026-02-21T08:17:00.000Z"
    }
}
```

---

### 4. Update Student

**PUT** `/students/:student_id`

**URL Parameters:**
- `student_id` (required): Student ID (number)

**Request Body:**
```json
{
  "studentNumber": "SE23002",
  "studentName": "Ahmad Bin Abdullah Updated",
  "mykadNumber": "020304101234",
  "address": "Kuala Lumpur",
  "gender": "Male"
}
```

**Example Request:**
```javascript
fetch('http://localhost:4000/api/students/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentNumber: "SE23002",
    studentName: "Ahmad Bin Abdullah Updated",
    mykadNumber: "020304101234",
    address: "Kuala Lumpur",
    gender: "Male"
  })
})
```

**Example Response:**
```json
{
    "statusCode": 200,
    "success": true,
    "message": "Student updated successfully",
    "data": {
        "studentId": 3,
        "studentNumber": "AIE0807",
        "mykadNumber": "990112108765",
        "email": "daniel.ai@monash.edu",
        "studentName": "Daniel Lee",
        "address": "Penang",
        "gender": "Male",
        "courseId": 3,
        "courseCode": "AIE",
        "courseName": "Bachelor of Software Engineerings",
        "createdAt": "2025-12-17T09:44:31.000Z",
        "updatedAt": "2026-02-21T08:18:21.000Z"
    }
}
```

---

### 5. Delete Student

**DELETE** `/students/:student_id`

**URL Parameters:**
- `student_id` (required): Student ID (number)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/students/1', {
  method: 'DELETE'
})
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student deleted successfully",
  "data": null
}
```

---

## 📖 Courses Endpoints

### 1. Get All Courses (with Pagination)

**GET** `/courses`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/courses?page=1&limit=10')
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Courses Retrieved successfully",
  "data": [
    {
      "courseId": 1,
      "courseCode": "SE",
      "courseName": "Bachelor of Software Engineering",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2. Get Course by Code

**GET** `/courses/:course_code`

**URL Parameters:**
- `course_code` (required): Course code (2-4 uppercase letters, e.g., "SE", "LAW")

**Example Request:**
```javascript
fetch('http://localhost:4000/api/courses/SE')
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "courseId": 1,
    "courseCode": "SE",
    "courseName": "Bachelor of Software Engineering",
    "createdAt": "2025-01-10T08:00:00.000Z",
    "updatedAt": "2025-01-10T08:00:00.000Z"
  }
}
```

---

### 3. Create Course

**POST** `/courses`

**Request Body:**
```json
{
  "courseCode": "SE",
  "courseName": "Bachelor of Software Engineering"
}
```

**Field Rules:**
- `courseCode`: Required, 2-4 uppercase letters (e.g., "SE", "LAW", "MED")
- `courseName`: Required, max 100 characters

**Example Request:**
```javascript
fetch('http://localhost:4000/api/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseCode: "SE",
    courseName: "Bachelor of Software Engineering"
  })
})
```

**Example Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Course created successfully",
  "data": {
    "courseId": 7,
    "courseCode": "SE",
    "courseName": "Bachelor of Software Engineering"
  }
}
```

---

### 4. Update Course

**PUT** `/courses/:course_id`

**URL Parameters:**
- `course_id` (required): Course ID (number)

**Request Body:**
```json
{
  "courseCode": "SE",
  "courseName": "Bachelor of Software Engineering (Updated)"
}
```

**Example Request:**
```javascript
fetch('http://localhost:4000/api/courses/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseCode: "SE",
    courseName: "Bachelor of Software Engineering (Updated)"
  })
})
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "courseCode": "SE",
    "courseName": "Bachelor of Software Engineering (Updated)",
    "courseId": 1
  }
}
```

---

### 5. Delete Course

**DELETE** `/courses/:course_id`

**URL Parameters:**
- `course_id` (required): Course ID (number)

**Note**: This will fail if students are enrolled in the course (foreign key constraint)

**Example Request:**
```javascript
fetch('http://localhost:4000/api/courses/1', {
  method: 'DELETE'
})
```

**Example Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course deleted successfully",
  "data": null
}
```

---

## 💻 Frontend Integration Guide

### Basic Fetch Example

Here's how to integrate this API into your frontend application:

#### 1. Get All Students with Pagination

```javascript
async function getStudents(page = 1, limit = 10) {
  try {
    const response = await fetch(`http://localhost:4000/api/students?page=${page}&limit=${limit}`)
    const result = await response.json()
    
    if (!response.ok) {
      console.error('Error:', result.message)
      return null
    }
    
    return {
      students: result.data,
      pagination: result.pagination
    }
  } catch (error) {
    console.error('Network error:', error)
    return null
  }
}

// Usage
const { students, pagination } = await getStudents(1, 10)
console.log(students)
console.log('Total pages:', pagination.totalPages)
```

#### 2. Create a Student

```javascript
async function createStudent(studentData) {
  try {
    const response = await fetch('http://localhost:4000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentName: studentData.name,
        studentNumber: studentData.number,
        email: studentData.email,
        mykadNumber: studentData.mykad,
        address: studentData.address || null,
        gender: studentData.gender || null
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message)
    }
    
    return result.data
  } catch (error) {
    console.error('Error creating student:', error.message)
    throw error
  }
}

// Usage
try {
  const newStudent = await createStudent({
    name: "Ahmad Bin Abdullah",
    number: "SE23001",
    email: "ahmad@monash.edu",
    mykad: "020304101234",
    address: "Selangor",
    gender: "Male"
  })
  console.log('Student created:', newStudent)
} catch (error) {
  alert('Failed to create student: ' + error.message)
}
```

#### 3. Update a Student

```javascript
async function updateStudent(studentId, studentData) {
  try {
    const response = await fetch(`http://localhost:4000/api/students/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentNumber: studentData.number,
        studentName: studentData.name,
        mykadNumber: studentData.mykad,
        address: studentData.address || null,
        gender: studentData.gender || null
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message)
    }
    
    return result.data
  } catch (error) {
    console.error('Error updating student:', error.message)
    throw error
  }
}

// Usage
await updateStudent(1, {
  number: "SE23002",
  name: "Ahmad Bin Abdullah Updated",
  mykad: "020304101234",
  address: "Kuala Lumpur",
  gender: "Male"
})
```

#### 4. Delete a Student

```javascript
async function deleteStudent(studentId) {
  try {
    const response = await fetch(`http://localhost:4000/api/students/${studentId}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting student:', error.message)
    throw error
  }
}

// Usage
if (confirm('Are you sure you want to delete this student?')) {
  await deleteStudent(1)
  console.log('Student deleted successfully')
}
```


---

## 🧠 Code Concepts

### 1. Request/Response Transformation

The API automatically converts between naming conventions:

- **Frontend sends**: `camelCase` (e.g., `studentName`, `studentId`)
- **Backend receives**: Transformed to `snake_case` (e.g., `student_name`, `student_id`)
- **Database stores**: `snake_case`
- **API responds**: Transformed back to `camelCase`

This is handled by middleware in `src/middleware/transformRequest.js`

### 2. Validation with Zod

All requests are validated using Zod schemas before reaching controllers:

```javascript
// Example: Student validation schema
const studentNumber = z.string()
  .min(1, 'Student number is required')
  .transform(val => val.toUpperCase().trim())
  .refine(val => /^[A-Z]{2,4}[0-9]{4,5}$/.test(val), {
    message: 'Invalid student number format (e.g., LAW0504, SE03001)'
  })
```

**Validation happens in middleware** - invalid requests are rejected with 400 status before reaching controllers.

### 3. Auto-Detection of Course from Student Number

When creating/updating a student:
1. System extracts prefix from `student_number` (e.g., "SE23001" → "SE")
2. Looks up `course_id` from `courses` table where `course_code = "SE"`
3. Automatically assigns the `course_id`

This eliminates the need to send `course_id` in the request body.

---

## 📁 Project Structure

```
monash-api/
├── src/
│   ├── config/
│   │   ├── connection.js      # MySQL connection pool
│   │   └── env.js             # Environment variable validation
│   ├── controllers/
│   │   ├── students.controller.js  # Student business logic
│   │   └── courses.controller.js  # Course business logic
│   ├── db/
│   │   └── monash.sql         # Database schema & seed data
│   ├── middleware/
│   │   ├── errorHandler.middleware.js    # Global error handler
│   │   ├── transformRequest.middleware.js  # camelCase ↔ snake_case
│   │   └── validateZod.middleware.js    # Zod validation middleware
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── students.routes.js # Student routes
│   │   └── courses.routes.js # Course routes
│   ├── utils/
│   │   ├── caseTransform.js   # camelCase/snake_case utilities
│   │   ├── logger.js          # Winston logger setup
│   │   ├── pagination.js      # Reusable pagination utility
│   │   └── response.js        # Standardized response helper
│   └── validations/
│       ├── studentValidation.js  # Student Zod schemas
│       └── courseValidation.js  # Course Zod schemas
├── public/
│   └── index.html             # Frontend demo
├── logs/
│   └── error.log              # Error logs
├── app.js                     # Express app setup
├── server.js                   # Server entry point
└── package.json
```

---

## 🔄 Common Patterns

### Pattern 1: Controller Structure

```javascript
export const getAllStudents = async (req, res, next) => {
    try {
        // 1. Get data from request (already validated & transformed)
        const page = req.query.page || 1
        
        // 2. Query database
        const { data, pagination } = await paginate(db, baseQuery, req.query)
        
        // 3. Return response
        return response(res, 200, 'Students Retrieved successfully', data, null, [], pagination)
    } catch (error) {
        // 4. Pass error to error handler
        next(error)
    }
}
```

### Pattern 2: Route Definition

```javascript
router.get('/students', getAllStudents)
router.get('/students/:student_id', validateZod(getStudentByIdSchema, 'params'), getStudentById)
router.post('/students', validateZod(createStudentSchema, 'body'), createStudent)
router.put('/students/:student_id', validateZod(getStudentByIdSchema, 'params'), validateZod(updateStudentSchema, 'body'), updateStudent)
router.delete('/students/:student_id', validateZod(deleteStudentSchema, 'params'), deleteStudent)
```

### Pattern 3: Validation Schema

```javascript
const studentNumber = z.string()
  .min(1, 'Student number is required')
  .transform(val => val.toUpperCase().trim())
  .refine(val => /^[A-Z]{2,4}[0-9]{4,5}$/.test(val), {
    message: 'Invalid student number format'
  })

export const createStudentSchema = z.object({
  student_name: studentName,
  student_number: studentNumber,
  email: email,
  // ...
})
```

---



## 📝 Notes for Frontend Developers

1. **Always send data in camelCase** - The API will transform it automatically
2. **Always receive data in camelCase** - The API transforms database responses automatically
3. **Check `response.ok`** before accessing `result.data`
4. **Handle pagination** - Use `result.pagination` for navigation controls
5. **Error handling** - Check `result.errorCode` for specific error types
6. **Student number** - Don't send `courseId` when creating/updating students; it's auto-detected

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Zod Documentation](https://zod.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📄 License

ISC

---

## 👥 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

**Happy Coding!**

