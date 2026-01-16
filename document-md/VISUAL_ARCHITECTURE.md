# 🎨 Visual Architecture & Diagrams

## API Flow Diagram

### Before (Current State)
```
User Request
    ↓
Express App
    ├→ No Auth Check ❌
    ├→ No Role Check ❌
    ├→ Route Handler
    │   ├→ Input Validation ✓
    │   ├→ DB Query ✓
    │   └→ Response (Inconsistent) ⚠️
    └→ Client Response
```

### After Phase 1
```
User Request
    ↓
[1] RequestID Middleware
    │ ├→ Adds req.id for tracing
    │ └→ Adds X-Request-ID to response
    ↓
[2] CORS Middleware
    │ ├→ Checks origin
    │ └→ Sets CORS headers
    ↓
[3] Body Parser
    │ └→ Parses JSON
    ↓
[4] Auth Middleware
    │ ├→ Checks Authorization header
    │ ├→ Validates JWT token
    │ └→ Adds req.user ✓
    ↓
[5] RBAC Middleware (Per Route)
    │ ├→ Checks req.user.role
    │ ├→ Allows: admin, lecturer, student?
    │ └→ Rejects if insufficient perms → 403
    ↓
[6] Route Handler
    │ ├→ Validation ✓
    │ ├→ Service Layer (future)
    │ ├→ DB Query ✓
    │ ├→ Response Mapping ✓
    │ └→ Standard Response Format ✓
    ↓
[7] Error Handler
    │ ├→ Catches errors
    │ ├→ Logs with request ID
    │ └→ Returns standard error response
    ↓
Client Response (Consistent, Secure)
```

---

## Access Control Matrix

```
┌────────────────────┬─────────┬─────────┬──────────┬────────────┐
│ Endpoint           │ Student │ Lecturer│ Admin    │ Anonymous  │
├────────────────────┼─────────┼─────────┼──────────┼────────────┤
│ GET /students      │   ✗     │   ✓     │   ✓      │   ✗        │
│ GET /students/:id  │ Own✓    │   ✓     │   ✓      │   ✗        │
│ POST /students     │   ✗     │   ✗     │   ✓      │   ✗        │
│ PUT /students      │ Own✓    │   ✗     │   ✓      │   ✗        │
│ DELETE /students/:id│   ✗     │   ✗     │   ✓      │   ✗        │
├────────────────────┼─────────┼─────────┼──────────┼────────────┤
│ GET /courses       │   ✓     │   ✓     │   ✓      │   ✗        │
│ POST /courses      │   ✗     │   ✗     │   ✓      │   ✗        │
│ PUT /courses       │   ✗     │   ✗     │   ✓      │   ✗        │
│ DELETE /courses    │   ✗     │   ✗     │   ✓      │   ✗        │
├────────────────────┼─────────┼─────────┼──────────┼────────────┤
│ POST /auth/signup  │   ✓     │   ✗     │   ✗      │   ✓        │
│ POST /auth/login   │   ✓     │   ✓     │   ✓      │   ✓        │
│ GET /auth/me       │   ✓     │   ✓     │   ✓      │   ✗        │
└────────────────────┴─────────┴─────────┴──────────┴────────────┘

Legend:
✓ = Allowed
✗ = Forbidden (403)
Own✓ = Can access own resource
✓ After login = Public but requires auth
```

---

## Data Flow for Student Signup

```
Frontend                          Backend                      Database
┌─────────────┐                                              ┌─────────┐
│ Signup Form │                                              │ student │
└──────┬──────┘                                              │ table   │
       │                                                     └────┬────┘
       │ 1. POST /auth/signup/student                             │
       │    {matric_no, email, password, ...}                    │
       │────────────────────────────────────────────────────────→│
       │                                                          │
       │                   ┌─ Request Handler                    │
       │                   │  ├─ Validate format                 │
       │                   │  ├─ Hash password                   │
       │                   │  ├─ Check email not exists          │
       │                   │  └─ Check course exists             │
       │                   │      (FK check)                     │
       │                   │                                     │
       │                   │  INSERT INTO student                │
       │                   │  ├─ matric_no                       │
       │                   │  ├─ email                           │
       │                   │  ├─ password_hash                   │
       │                   │  ├─ student_name                    │
       │                   │  └─ course_id                       │
       │                   │                    ─────────────────→│
       │                   │                    INSERT completed │
       │                   │                    insertId: 5     │
       │                   │←───────────────────────────────────│
       │                   │                                     │
       │                   │  ┌─ Generate JWT Token             │
       │                   │  │  payload: {                      │
       │                   │  │    id: 5,                        │
       │                   │  │    email,                        │
       │                   │  │    role: 'student'               │
       │                   │  │  }                               │
       │                   │  │  expires: 7d                     │
       │                   │  └─ Token: eyJhbGc...              │
       │                   │                                     │
       │ 2. 201 Created                                          │
       │    {                                                    │
       │      success: true,                                     │
       │      payload: {                                         │
       │        token: "eyJhbGc...",                            │
       │        user: { id, email, role }                       │
       │      },                                                 │
       │      message: "Signup successful"                       │
       │    }                                                    │
       │←────────────────────────────────────────────────────────│
       │                                                          │
       │ 3. Store token in localStorage                          │
       │                                                          │
       │ 4. Redirect to /dashboard                               │
       │                                                          │
```

---

## JWT Token Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN LIFECYCLE                            │
└──────────────────────────────────────────────────────────────────┘

1. GENERATION (on signup/login)
   ┌─────────────────────────┐
   │ User credentials valid? │
   └────────┬────────────────┘
            │ YES
            ↓
   ┌─────────────────────────────────────────┐
   │ Payload: {id, email, role, matric_no}  │
   │ Secret: JWT_SECRET (from .env)         │
   │ Expiry: 7 days                         │
   └────────┬────────────────────────────────┘
            │
            ↓
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            │
            ├→ Send to Frontend
            ├→ Frontend stores in localStorage
            └→ Frontend includes in Authorization header


2. USAGE (on protected routes)
   Request Headers:
   ┌──────────────────────────────────┐
   │ Authorization: Bearer <token>    │
   └────────┬─────────────────────────┘
            │
            ↓
   ┌──────────────────────────────────┐
   │ Extract token from header        │
   │ Verify with JWT_SECRET           │
   │ Check expiry not passed          │
   └────────┬─────────────────────────┘
            │
       ┌────┴────┐
       │          │
      VALID    INVALID
       │          │
       ↓          ↓
   req.user   401 Error
   added      "Invalid token"


3. EXPIRY (7 days)
   Token created: Day 1
   Token expires: Day 8
   
   If used after expiry:
   ├→ Request: GET /auth/me
   ├→ Token check: 7+ days old ❌
   ├→ Response: 401 "Token expired"
   └→ Frontend: Redirect to login
            ↓
   User logs in again → New token


4. REFRESH (Phase 2 feature)
   // Not yet implemented
   // Future: POST /auth/refresh
   // Returns new token without re-login
```

---

## Error Handling Flow

```
Request comes in
    ↓
Try to process
    │
    ├→ No token → 401 (NO_AUTH_TOKEN)
    │
    ├→ Invalid token → 401 (INVALID_TOKEN)
    │
    ├→ Expired token → 401 (TOKEN_EXPIRED)
    │
    ├→ Wrong role → 403 (FORBIDDEN)
    │
    ├→ Missing fields → 400 (REQUIRED_ERROR)
    │
    ├→ Invalid format → 400 (INVALID_EMAIL/MATRIC/etc)
    │
    ├→ Duplicate email → 409 (DUPLICATE_EMAIL)
    │
    ├→ Student not found → 404 (STUDENT_NOT_FOUND)
    │
    ├→ Database error → 500 (SERVER_ERROR)
    │
    └→ Unknown error → 500 (INTERNAL_SERVER_ERROR)

Response format (all errors):
{
  "success": false,
  "payload": null,
  "message": "Human readable message",
  "statusCode": 400,
  "errorCode": "MACHINE_READABLE_CODE"
}
```

---

## File Organization

```
monash-api/
│
├── middleware/              ← Request processing
│   ├── auth.js             ✓ New: JWT + RBAC
│   ├── requestId.js        ✓ New: Request tracking
│   └── errorHandler.js     ← Update: Better errors
│
├── services/               ← Business logic
│   └── auth.service.js     ✓ New: Token + password
│
├── controllers/            ← HTTP handlers
│   ├── auth.controller.js  ✓ New: Signup/Login
│   ├── students.controller.js ← Keep but standardize
│   └── courses.controller.js  ← Keep but standardize
│
├── routes/                 ← API endpoints
│   ├── auth.routes.js      ✓ New
│   ├── students.routes.js  ← Update with auth guards
│   ├── courses.routes.js   ← Update with auth guards
│   └── index.js            ← Mount all routes
│
├── utils/                  ← Utilities
│   ├── response.js         ✓ Keep: Already good
│   ├── responseMapper.js   ✓ New: Standardize responses
│   └── validator.js        ✓ Keep: Already perfect
│
├── db/
│   └── connection.js       ✓ Keep: Good pool config
│
├── app.js                  ← Express setup
├── server.js               ← Start server
├── package.json
├── .env                    ← Configuration
└── README.md
```

---

## Middleware Execution Order

```
Request arrives
    ↓
[1] RequestID Middleware
    ├→ req.id = uuid()
    ├→ res.setHeader('X-Request-ID', req.id)
    └→ next()
    ↓
[2] CORS Middleware
    ├→ Check origin allowed
    ├→ Set CORS headers
    └→ next()
    ↓
[3] Morgan (logging)
    ├→ Log method, path, status
    └→ next()
    ↓
[4] Express JSON Parser
    ├→ Parse req.body
    └→ next()
    ↓
[5] Route Handler
    ├→ [5a] Auth Middleware
    │   ├→ Extract token
    │   ├→ Verify JWT
    │   ├→ req.user = payload
    │   └→ next() or 401
    │   ↓
    │ [5b] RBAC Middleware (per route)
    │   ├→ Check req.user.role
    │   └→ next() or 403
    │   ↓
    │ [5c] Controller
    │   ├→ Process request
    │   ├→ Validate input
    │   ├→ Query DB
    │   └→ Send response
    │   ↓
    │ [5d] Error thrown?
    │   └→ Caught and passed to next()
    │
    ↓
[6] 404 Handler
    ├→ If no route matched
    └→ Send 404 response
    ↓
[7] Error Handler (Last)
    ├→ Process any error
    ├→ Log with request ID
    └→ Send error response

Response sent to client
```

---

## Request/Response Cycle Example

```
SCENARIO: Student accessing their own profile

CLIENT SENDS:
═════════════════════════════════════════════════════════════════════
GET /students/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InN0dWRlbnQifQ...
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000


SERVER PROCESSES:
═════════════════════════════════════════════════════════════════════
[RequestID Middleware]
  req.id = 550e8400-e29b-41d4-a716-446655440000
  ↓
[Auth Middleware]
  token = "eyJhbGci..." (extracted from header)
  verify(token, JWT_SECRET) → VALID
  req.user = {id: 5, role: 'student', email: 'test@ex.com'}
  ↓
[RBAC Middleware - ownerOnly]
  req.params.studentId = "5"
  req.user.id = 5
  5 === 5? YES → allowed
  ↓
[Controller: getStudentById]
  Validation: Is "5" a valid integer? YES
  Query: SELECT * FROM student WHERE student_id = 5
  Result: {student_id: 5, matric_no: 'CS2024', ...}
  Map result: mapStudent({...})
  ↓
[Response Mapper]
  Clean data: {student_id, matric_no, email, ...}
  Remove sensitive fields
  ↓
[Response Helper]
  response(200, cleanData, 'Student retrieved successfully', res)


SERVER SENDS:
═════════════════════════════════════════════════════════════════════
Status: 200 OK
Headers:
  X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json
  
Body:
{
  "success": true,
  "payload": {
    "student_id": 5,
    "matric_no": "CS2024",
    "email": "test@monash.edu.my",
    "student_name": "John Doe",
    "course_id": 1
  },
  "message": "Student retrieved successfully",
  "statusCode": 200,
  "errorCode": null
}


TIMELINE:
═════════════════════════════════════════════════════════════════════
T+0ms   : Request received
T+1ms   : RequestID assigned
T+2ms   : CORS headers set
T+3ms   : Body parsed
T+4ms   : Auth middleware - token verified
T+5ms   : RBAC middleware - access granted
T+6ms   : Controller called
T+8ms   : Database queried
T+10ms  : Response data mapped
T+11ms  : Response sent
Total: ~11ms
```

---

## Authentication State Machine

```
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION STATE MACHINE                    │
└─────────────────────────────────────────────────────────────┘

START
  │
  ├─→ UNAUTHENTICATED
  │    │
  │    ├─→ POST /auth/signup
  │    │    ├─ Valid data? → Account created → Token sent
  │    │    └─ Invalid data? → 400 error
  │    │
  │    ├─→ POST /auth/login
  │    │    ├─ Credentials valid? → AUTHENTICATED (token sent)
  │    │    └─ Invalid credentials? → 401 error
  │    │
  │    └─→ GET /protected routes
  │         └─ 401: "Not authenticated"
  │
  └─→ AUTHENTICATED (has valid token)
       │
       ├─→ Access allowed routes
       │    ├─ GET /students (if admin/lecturer)
       │    ├─ GET /students/:id (if owner)
       │    └─ POST /students (if admin)
       │
       ├─→ Access denied routes
       │    └─ 403: "Insufficient permissions"
       │
       ├─→ Token expires
       │    └─ 401: "Token expired"
       │
       └─→ POST /auth/logout (Phase 2)
            └─ Clear token → UNAUTHENTICATED
```

---

## Database Schema Changes

```
BEFORE:
┌──────────────────────────────────────────┐
│ student                                  │
├──────────────────────────────────────────┤
│ student_id (PK)                          │
│ matric_no (UK)                           │
│ no_kp                                    │
│ email                                    │
│ student_name                             │
│ address                                  │
│ gender                                   │
│ course_id (FK → courses)                 │
└──────────────────────────────────────────┘


AFTER (Phase 1):
┌──────────────────────────────────────────┐
│ student                                  │
├──────────────────────────────────────────┤
│ student_id (PK)                          │
│ matric_no (UK)                           │
│ no_kp                                    │
│ email (UK) ← CHANGED: now unique         │
│ password_hash ← NEW: for authentication  │
│ student_name                             │
│ address                                  │
│ gender                                   │
│ course_id (FK → courses)                 │
│ created_at ← NEW: audit                  │
│ updated_at ← NEW: audit                  │
└──────────────────────────────────────────┘

FUTURE (Phase 2+):
Additional tables:
├── refresh_tokens (for token rotation)
├── audit_logs (who did what when)
├── files (document storage metadata)
├── access_controls (granular permissions)
└── users (abstract user for multiple roles)
```

---

## Response Format Standardization

```
CURRENT (Inconsistent):
────────────────────────

POST /students → {affectedRows: 1, insertId: 5, ...}  ❌
POST /courses → {affectedRows: 1, insertId: 12, ...} ❌
GET /students → [{student_id: 1, ...}, ...]
GET /students/matric/:id → [{matric_no, student_name}] ← only 2 fields!

Frontend sees:
- payload.insertId vs payload.id vs payload.student_id
- Different field sets per endpoint
- Can't write consistent Zod schemas


AFTER Phase 1 (Consistent):
──────────────────────────

CREATE Response:
{
  "payload": {
    "id": 5,
    "matric_no": "CS2024",
    "email": "test@ex.com",
    "student_name": "John"
  }
}

GET Single Response:
{
  "payload": {
    "student_id": 5,
    "matric_no": "CS2024",
    "email": "test@ex.com",
    "student_name": "John",
    "course_id": 1,
    "created_at": "2024-01-13"
  }
}

GET List Response:
{
  "payload": [{...}, {...}],
  "metadata": {"count": 100}
}

UPDATE Response:
{
  "payload": {
    "affected": 1
  }
}

Frontend sees:
- Consistent field names
- Consistent payload structures
- Can write predictable Zod schemas ✓
```

---

## Performance Timeline (Expected)

```
Request Processing Time (Target: < 100ms)
────────────────────────────────────────

Middleware overhead:        1-2ms
├── Request ID
├── CORS
├── Body parsing
└── Auth/RBAC

Database operations:        5-50ms
├── Simple SELECT         5ms ✓
├── Complex JOIN          15-20ms
├── Large result set      30-50ms

Controller logic:          1-3ms
├── Validation
├── Response mapping

Response serialization:     1-2ms

Total expected: 8-57ms ✓ (under 100ms)

Slow queries (> 100ms):
├── Missing indexes
├── Wrong JOIN strategy
├── Large result sets
└── Need optimization
```

---

This completes your visual understanding of the architecture!

