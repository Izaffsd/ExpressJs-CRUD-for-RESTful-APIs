# Phase 1 Implementation Guide - Auth & File Upload

## Overview

This guide translates the architecture review into concrete Phase 1 code. Follow these steps sequentially.

---

## Step 1: Add Authentication Middleware

### Create: `middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken'
import { response } from '../utils/response.js'

/**
 * Verify JWT token from Authorization header
 * Adds req.user with decoded token data
 */
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response(401, null, 'Missing or invalid authorization header', res, 'NO_AUTH_TOKEN')
    }

    const token = authHeader.substring(7) // Remove 'Bearer '

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        req.requestId = req.id // Add request ID to user context
        next()
    } catch (error) {
        return response(401, null, 'Invalid or expired token', res, 'INVALID_TOKEN')
    }
}

/**
 * Verify user has required roles
 * Usage: authorize('admin', 'lecturer')
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return response(401, null, 'Not authenticated', res, 'NOT_AUTHENTICATED')
        }

        if (!allowedRoles.includes(req.user.role)) {
            return response(403, null, 'Insufficient permissions for this action', res, 'FORBIDDEN')
        }

        next()
    }
}

/**
 * Verify resource belongs to authenticated user
 * Usage: ownerOnly (for student accessing own profile)
 */
export const ownerOnly = (resourceIdField = 'studentId') => {
    return (req, res, next) => {
        const resourceId = req.params[resourceIdField] || req.body[resourceIdField]
        
        // Admin can access anything
        if (req.user.role === 'admin') {
            return next()
        }

        // Student can only access own data
        if (req.user.role === 'student' && req.user.student_id !== parseInt(resourceId)) {
            return response(403, null, 'Cannot access other student data', res, 'FORBIDDEN')
        }

        next()
    }
}
```

**Why this structure:**
- `authenticate` - validates token exists and is valid
- `authorize` - checks role-based permissions
- `ownerOnly` - prevents unauthorized resource access (student accessing another student's profile)

---

## Step 2: Add Request ID Middleware

### Update: `middleware/requestId.js`

```javascript
import { v4 as uuidv4 } from 'uuid'

/**
 * Adds unique ID to each request for logging/tracing
 * Available as req.id in all handlers
 */
export const requestIdMiddleware = (req, res, next) => {
    req.id = uuidv4()
    res.setHeader('X-Request-ID', req.id)
    next()
}
```

---

## Step 3: Update app.js to Use Middleware

### Current app.js Problem:
```javascript
import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import routes from './routes/index.js'

const app = express()

// ❌ No auth middleware
// ❌ No request ID tracking
// ❌ No CORS
```

### Updated app.js:
```javascript
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import morgan from 'morgan'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { requestIdMiddleware } from './middleware/requestId.js'

const app = express()

// Request tracking
app.use(requestIdMiddleware)

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'))
} else {
    app.use(morgan('dev'))
}

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', routes)

// Error handlers (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
```

**Install required packages:**
```bash
npm install cors uuid
```

---

## Step 4: Update Students Routes with Auth

### Current routes/students.routes.js Problem:
```javascript
// ❌ All endpoints public - no auth
router.get('/students', getAllStudents)
```

### Updated routes/students.routes.js:
```javascript
import express from 'express'
import {
    getAllStudents,
    getStudentById,
    getStudentByMatricNo,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/students.controller.js'
import { authenticate, authorize, ownerOnly } from '../middleware/auth.js'

const router = express.Router()

// Public routes (signup, login - will add later)
// router.post('/auth/signup/student', createStudent)

// Protected routes

// GET all students - admin/lecturer only
router.get('/students', authenticate, authorize('admin', 'lecturer'), getAllStudents)

// GET student by ID - owner or admin
router.get('/students/:studentId', authenticate, ownerOnly('studentId'), getStudentById)

// GET student by matric - authenticated
router.get('/students/matric/:matricNo', authenticate, getStudentByMatricNo)

// POST create student - admin only or public signup (TBD)
router.post('/students', authenticate, authorize('admin'), createStudent)

// PUT update student - owner or admin
router.put('/students', authenticate, authorize('admin', 'student'), updateStudent)

// DELETE student - admin only
router.delete('/students/:studentId', authenticate, authorize('admin'), deleteStudent)

export default router
```

**Access Matrix (this is what above implements):**
```
Endpoint                  | Student | Lecturer | Admin | Public
GET /students             |    ✗    |    ✓     |   ✓   |   ✗
GET /students/:id         |   Own   |    ✓     |   ✓   |   ✗
GET /students/matric/:m   |   ✓*    |    ✓     |   ✓   |   ✗ (*own)
POST /students            |    ✗    |    ✗     |   ✓   |   ✗
PUT /students             |   Own   |    ✗     |   ✓   |   ✗
DELETE /students/:id      |    ✗    |    ✗     |   ✓   |   ✗

*Student can search by matric only during signup
```

---

## Step 5: Create Auth Service

### Create: `services/auth.service.js`

```javascript
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import db from '../db/connection.js'

/**
 * Authentication service
 * Handles token generation, verification, and user lookups
 */
export class AuthService {
    /**
     * Generate JWT token for user
     */
    static generateToken(user) {
        const payload = {
            id: user.id,
            student_id: user.student_id || null,
            email: user.email,
            role: user.role, // 'student', 'lecturer', 'admin'
            matric_no: user.matric_no || null
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        )

        return token
    }

    /**
     * Hash password for storage
     * Using crypto instead of bcrypt for MVP
     * TODO: Replace with bcrypt in production
     */
    static hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
            .toString('hex')
        return `${salt}:${hash}`
    }

    /**
     * Verify password against stored hash
     */
    static verifyPassword(password, storedHash) {
        const [salt, hash] = storedHash.split(':')
        const hashToCheck = crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
            .toString('hex')
        return hash === hashToCheck
    }

    /**
     * Find user by email (across all roles)
     */
    static async findUserByEmail(email) {
        // Check students table
        let [student] = await db.query(
            'SELECT student_id as id, email, matric_no, student_name as name, "student" as role FROM student WHERE email = ?',
            [email]
        )

        if (student && student.length > 0) {
            return student[0]
        }

        // TODO: Check lecturer table
        // TODO: Check admin table

        return null
    }

    /**
     * Create refresh token (for later phase)
     */
    static generateRefreshToken(userId) {
        const token = crypto.randomBytes(32).toString('hex')
        // TODO: Store in refresh_tokens table
        return token
    }
}
```

---

## Step 6: Create Auth Controller

### Create: `controllers/auth.controller.js`

```javascript
import { response } from '../utils/response.js'
import { AuthService } from '../services/auth.service.js'
import { validEmail } from '../utils/validator.js'
import db from '../db/connection.js'

/**
 * Student signup
 * POST /auth/signup/student
 */
export const signupStudent = async (req, res) => {
    try {
        const { matric_no, email, password, student_name, course_id } = req.body

        // Validate required fields
        if (!matric_no || !email || !password || !student_name || !course_id) {
            return response(400, null, 'Missing required fields', res, 'REQUIRED_ERROR')
        }

        // Validate email format
        if (!validEmail(email)) {
            return response(400, null, 'Invalid email format', res, 'INVALID_EMAIL')
        }

        // Validate password strength (min 8 chars)
        if (password.length < 8) {
            return response(400, null, 'Password must be at least 8 characters', res, 'WEAK_PASSWORD')
        }

        // Check if email already exists
        const [existingUser] = await db.query('SELECT id FROM student WHERE email = ?', [email])
        if (existingUser && existingUser.length > 0) {
            return response(409, null, 'Email already registered', res, 'EMAIL_EXISTS')
        }

        // Hash password
        const hashedPassword = AuthService.hashPassword(password)

        // Create student account
        const [result] = await db.query(
            'INSERT INTO student (matric_no, email, password_hash, student_name, course_id) VALUES (?, ?, ?, ?, ?)',
            [matric_no, email, hashedPassword, student_name, course_id]
        )

        if (result.affectedRows !== 1) {
            return response(400, null, 'Failed to create account', res, 'SIGNUP_FAILED')
        }

        // Generate token
        const user = {
            id: result.insertId,
            student_id: result.insertId,
            email,
            student_name,
            role: 'student'
        }

        const token = AuthService.generateToken(user)

        return response(201, { token, user }, 'Student registered successfully', res)

    } catch (error) {
        console.error(`[${req.id}] [SIGNUP STUDENT ERROR]`, error)

        if (error.code === 'ER_DUP_ENTRY') {
            return response(409, null, 'Matric number or email already exists', res, 'DUPLICATE_ENTRY')
        }

        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

/**
 * Student login
 * POST /auth/login
 */
export const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return response(400, null, 'Email and password required', res, 'REQUIRED_ERROR')
        }

        // Find student by email
        const [students] = await db.query(
            'SELECT student_id, email, password_hash, student_name, matric_no FROM student WHERE email = ?',
            [email]
        )

        if (students.length === 0) {
            return response(401, null, 'Invalid email or password', res, 'INVALID_CREDENTIALS')
        }

        const student = students[0]

        // Verify password
        const isPasswordValid = AuthService.verifyPassword(password, student.password_hash)

        if (!isPasswordValid) {
            return response(401, null, 'Invalid email or password', res, 'INVALID_CREDENTIALS')
        }

        // Generate token
        const user = {
            id: student.student_id,
            student_id: student.student_id,
            email: student.email,
            name: student.student_name,
            matric_no: student.matric_no,
            role: 'student'
        }

        const token = AuthService.generateToken(user)

        return response(200, { token, user }, 'Login successful', res)

    } catch (error) {
        console.error(`[${req.id}] [LOGIN ERROR]`, error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}

/**
 * Get current user profile
 * GET /auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = req.user

        // Fetch full user data
        const [students] = await db.query(
            'SELECT student_id, email, student_name, matric_no, course_id FROM student WHERE student_id = ?',
            [user.student_id]
        )

        if (students.length === 0) {
            return response(404, null, 'User not found', res, 'USER_NOT_FOUND')
        }

        return response(200, students[0], 'User profile', res)

    } catch (error) {
        console.error(`[${req.id}] [GET ME ERROR]`, error)
        return response(500, null, 'Internal server error', res, 'SERVER_ERROR')
    }
}
```

---

## Step 7: Create Auth Routes

### Create: `routes/auth.routes.js`

```javascript
import express from 'express'
import { signupStudent, loginStudent, getMe } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/auth/signup/student', signupStudent)
router.post('/auth/login', loginStudent)

// Protected routes
router.get('/auth/me', authenticate, getMe)

export default router
```

---

## Step 8: Update routes/index.js

```javascript
import express from 'express'
import { response } from '../utils/response.js'
import authRoutes from './auth.routes.js'
import studentsRoutes from './students.routes.js'
import coursesRoutes from './courses.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
    response(200, 'Monash API v1', 'Welcome to Monash Management API', res)
})

// Mount route modules
router.use(authRoutes)
router.use(studentsRoutes)
router.use(coursesRoutes)

export default router
```

---

## Step 9: Update .env

Add to your `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=monash_db

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
MORGAN_LOG=dev
```

**IMPORTANT:** Replace `JWT_SECRET` with a real 32+ character string in production.

---

## Step 10: Update Database Schema

Add password column to student table:

```sql
ALTER TABLE student ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE student MODIFY COLUMN password_hash VARCHAR(255);

-- Make email unique for auth
ALTER TABLE student ADD UNIQUE INDEX idx_email (email);

-- Optional: Add created_at for audit
ALTER TABLE student ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE student ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

## Testing the Auth Flow

### 1. Signup
```bash
curl -X POST http://localhost:5000/auth/signup/student \
  -H "Content-Type: application/json" \
  -d '{
    "matric_no": "CS2024",
    "email": "student@monash.edu.my",
    "password": "SecurePass123",
    "student_name": "John Doe",
    "course_id": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "payload": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "student_id": 1,
      "email": "student@monash.edu.my",
      "student_name": "John Doe",
      "role": "student"
    }
  },
  "message": "Student registered successfully",
  "statusCode": 201
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@monash.edu.my",
    "password": "SecurePass123"
  }'
```

### 3. Access Protected Route with Token
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Frontend Integration (Coming Next)

Update your `src/lib/axios.ts`:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

## Security Checklist

- [ ] JWT_SECRET is 32+ random characters
- [ ] Password hashing implemented (use bcrypt in production)
- [ ] Email validation working
- [ ] CORS configured for frontend URL only
- [ ] Rate limiting added (next step)
- [ ] Passwords not logged anywhere
- [ ] Tokens expire after reasonable time
- [ ] Refresh tokens implemented (Phase 2)

---

## Next Steps

1. **File Upload Setup** - Add multer middleware
2. **Rate Limiting** - Prevent brute force
3. **Email Verification** - Send confirmation emails
4. **Role-based Signup** - Lecturer/Admin signup endpoints
5. **Password Reset** - Forgot password flow

