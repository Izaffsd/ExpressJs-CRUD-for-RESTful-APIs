# Student API Error Codes Reference Guide

## HTTP Status Codes

### Success Responses
| Status | Meaning | Use Case |
|--------|---------|----------|
| **200** | OK | GET request successful, data retrieved |
| **201** | Created | POST request successful, resource created |
| **204** | No Content | DELETE successful |

### Client Errors (4xx)
| Status | Meaning | Use Case |
|--------|---------|----------|
| **400** | Bad Request | Invalid input, validation failed, missing fields |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate entry, constraint violation |

### Server Errors (5xx)
| Status | Meaning | Use Case |
|--------|---------|----------|
| **503** | Service Unavailable | Database error, connection lost |

---

## Error Codes by Category

### Validation Errors (400)
```
INVALID_STUDENT_ID_400          - Invalid student ID format
Invalid student id

INVALID_STUDENT_MATRIC_400      - Invalid matric number format
Invalid Student Matric

INVALID_EMAIL_400               - Invalid email format
Invalid email input

INVALID_NO_KP_400               - Invalid No KP format
Invalid No KP input

INVALID_COURSE_ID_400           - Invalid course ID format
Invalid Course Id

REQUIRED_MATRIC_NO_400          - Missing matric number
Missing required Matric Number

REQUIRED_NO_KP_400              - Missing No KP
Missing required No KP

REQUIRED_EMAIL_400              - Missing email
Missing required Email

REQUIRED_STUDENT_NAME_400       - Missing student name
Missing required Student Name

REQUIRED_COURSE_ID_400          - Missing course ID
Missing required Course ID

REQUIRED_ERROR_400              - Multiple required fields missing
Missing required fields

STUDENT_NOT_CREATED_400         - Insert operation failed
Student not created
```

### Not Found Errors (404)
```
STUDENT_NOT_FOUND_404           - Student with given ID doesn't exist
Student not found

COURSE_NOT_FOUND_404            - Course with given ID doesn't exist
Course Not Found
```

### Conflict Errors (409)
```
DUPLICATE_STUDENT_409           - Student already exists (duplicate email/matric/no_kp)
Student Already Exists

DUPLICATE_STUDENT_409           - Student information already exists during update
Student information already exists
```

### Database/Server Errors (503)
```
STUDENT_FETCH_FAILED_503        - getAllStudents() database error
Failed to fetch students

STUDENT_RETRIEVE_FAILED_503     - getStudentById() database error
Failed to retrieve student

STUDENT_CREATE_FAILED_503       - createStudent() database error
Failed to create student

STUDENT_UPDATE_FAILED_503       - updateStudent() database error
Failed to update student

STUDENT_DELETE_FAILED_503       - deleteStudent() database error
Failed to delete student
```

---

## Common Database Errors & Solutions

| Error Code | Database Error | Cause | Solution |
|----------|----------------|-------|----------|
| `DUPLICATE_STUDENT_409` | `ER_DUP_ENTRY` | Email, Matric No, or No KP already exists | Check if student exists, use different values |
| `STUDENT_FETCH_FAILED_503` | Connection lost | Database unavailable | Check database connection status |
| Data truncated | Column size exceeded | String too long for column | Verify input length matches column definition |
| `ER_BAD_FIELD_ERROR` | Unknown column 'undefined' | Sending undefined/null in UPDATE | Validate all fields before sending, don't send undefined values |
| `COURSE_NOT_FOUND_404` | `ER_NO_REFERENCED_ROW` | Foreign key constraint - Course ID doesn't exist | Ensure course exists before assigning to student |

---

## Error Handling Flow

### GET /students
- ✅ Success (200) → Returns array of students
  ```json
  {
    "statusCode": 200,
    "message": "All Students successfully",
    "data": [...]
  }
  ```
- ❌ Database error (503) → STUDENT_FETCH_FAILED_503
  ```json
  {
    "statusCode": 503,
    "message": "Failed to fetch students",
    "data": null,
    "errorCode": "STUDENT_FETCH_FAILED_503"
  }
  ```

### GET /students/:studentId
- ✅ Success (200) → Returns student object
  ```json
  {
    "statusCode": 200,
    "message": "Student by Id successfully",
    "data": {...}
  }
  ```
- ❌ Invalid ID (400) → INVALID_STUDENT_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid student id",
    "data": null,
    "errorCode": "INVALID_STUDENT_ID_400"
  }
  ```
- ❌ Not found (404) → STUDENT_NOT_FOUND_404
  ```json
  {
    "statusCode": 404,
    "message": "Student not found",
    "data": null,
    "errorCode": "STUDENT_NOT_FOUND_404"
  }
  ```
- ❌ Database error (503) → STUDENT_RETRIEVE_FAILED_503
  ```json
  {
    "statusCode": 503,
    "message": "Failed to retrieve student",
    "data": null,
    "errorCode": "STUDENT_RETRIEVE_FAILED_503"
  }
  ```

### POST /students
- ✅ Created (201) → Returns inserted data
  ```json
  {
    "statusCode": 201,
    "message": "Student created successfully",
    "data": {...}
  }
  ```
- ❌ Missing matric number (400) → REQUIRED_MATRIC_NO_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required Matric Number",
    "data": null,
    "errorCode": "REQUIRED_MATRIC_NO_400"
  }
  ```
- ❌ Missing No KP (400) → REQUIRED_NO_KP_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required No KP",
    "data": null,
    "errorCode": "REQUIRED_NO_KP_400"
  }
  ```
- ❌ Missing email (400) → REQUIRED_EMAIL_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required Email",
    "data": null,
    "errorCode": "REQUIRED_EMAIL_400"
  }
  ```
- ❌ Missing student name (400) → REQUIRED_STUDENT_NAME_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required Student Name",
    "data": null,
    "errorCode": "REQUIRED_STUDENT_NAME_400"
  }
  ```
- ❌ Missing course ID (400) → REQUIRED_COURSE_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required Course ID",
    "data": null,
    "errorCode": "REQUIRED_COURSE_ID_400"
  }
  ```
- ❌ Invalid matric format (400) → INVALID_STUDENT_MATRIC_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid Student Matric",
    "data": null,
    "errorCode": "INVALID_STUDENT_MATRIC_400"
  }
  ```
- ❌ Invalid email format (400) → INVALID_EMAIL_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid email input",
    "data": null,
    "errorCode": "INVALID_EMAIL_400"
  }
  ```
- ❌ Invalid No KP format (400) → INVALID_NO_KP_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid No KP input",
    "data": null,
    "errorCode": "INVALID_NO_KP_400"
  }
  ```
- ❌ Invalid course ID format (400) → INVALID_COURSE_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid Course Id",
    "data": null,
    "errorCode": "INVALID_COURSE_ID_400"
  }
  ```
- ❌ Course doesn't exist (404) → COURSE_NOT_FOUND_404
  ```json
  {
    "statusCode": 404,
    "message": "Course Not Found",
    "data": null,
    "errorCode": "COURSE_NOT_FOUND_404"
  }
  ```
- ❌ Student not created (400) → STUDENT_NOT_CREATED_400
  ```json
  {
    "statusCode": 400,
    "message": "Student not created",
    "data": null,
    "errorCode": "STUDENT_NOT_CREATED_400"
  }
  ```
- ❌ Duplicate entry (409) → DUPLICATE_STUDENT_409
  ```json
  {
    "statusCode": 409,
    "message": "Student Already Exists",
    "data": null,
    "errorCode": "DUPLICATE_STUDENT_409"
  }
  ```
- ❌ Database error (503) → STUDENT_CREATE_FAILED_503
  ```json
  {
    "statusCode": 503,
    "message": "Failed to create student",
    "data": null,
    "errorCode": "STUDENT_CREATE_FAILED_503"
  }
  ```

### PUT /students/:studentId
- ✅ Updated (200) → Returns update result
  ```json
  {
    "statusCode": 200,
    "message": "Student updated successfully",
    "data": {...}
  }
  ```
- ❌ Missing required fields (400) → REQUIRED_ERROR_400
  ```json
  {
    "statusCode": 400,
    "message": "Missing required fields",
    "data": null,
    "errorCode": "REQUIRED_ERROR_400"
  }
  ```
- ❌ Invalid student ID (400) → INVALID_STUDENT_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid student id",
    "data": null,
    "errorCode": "INVALID_STUDENT_ID_400"
  }
  ```
- ❌ Invalid matric format (400) → INVALID_STUDENT_MATRIC_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid Student Matric",
    "data": null,
    "errorCode": "INVALID_STUDENT_MATRIC_400"
  }
  ```
- ❌ Invalid email format (400) → INVALID_EMAIL_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid email input",
    "data": null,
    "errorCode": "INVALID_EMAIL_400"
  }
  ```
- ❌ Invalid No KP format (400) → INVALID_NO_KP_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid No KP input",
    "data": null,
    "errorCode": "INVALID_NO_KP_400"
  }
  ```
- ❌ Invalid course ID format (400) → INVALID_COURSE_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid Course Id",
    "data": null,
    "errorCode": "INVALID_COURSE_ID_400"
  }
  ```
- ❌ Course doesn't exist (404) → COURSE_NOT_FOUND_404
  ```json
  {
    "statusCode": 404,
    "message": "Course Not Found",
    "data": null,
    "errorCode": "COURSE_NOT_FOUND_404"
  }
  ```
- ❌ Student not found (404) → STUDENT_NOT_FOUND_404
  ```json
  {
    "statusCode": 404,
    "message": "Student not found",
    "data": null,
    "errorCode": "STUDENT_NOT_FOUND_404"
  }
  ```
- ❌ Duplicate entry (409) → DUPLICATE_STUDENT_409
  ```json
  {
    "statusCode": 409,
    "message": "Student information already exists",
    "data": null,
    "errorCode": "DUPLICATE_STUDENT_409"
  }
  ```
- ❌ Database error (503) → STUDENT_UPDATE_FAILED_503
  ```json
  {
    "statusCode": 503,
    "message": "Failed to update student",
    "data": null,
    "errorCode": "STUDENT_UPDATE_FAILED_503"
  }
  ```

### DELETE /students/:studentId
- ✅ Deleted (200) → Returns delete result
  ```json
  {
    "statusCode": 200,
    "message": "Student deleted successfully",
    "data": {...}
  }
  ```
- ❌ Invalid ID (400) → INVALID_STUDENT_ID_400
  ```json
  {
    "statusCode": 400,
    "message": "Invalid Student Id",
    "data": null,
    "errorCode": "INVALID_STUDENT_ID_400"
  }
  ```
- ❌ Not found (404) → STUDENT_NOT_FOUND_404
  ```json
  {
    "statusCode": 404,
    "message": "Student Not Found",
    "data": null,
    "errorCode": "STUDENT_NOT_FOUND_404"
  }
  ```
- ❌ Database error (503) → STUDENT_DELETE_FAILED_503
  ```json
  {
    "statusCode": 503,
    "message": "Failed to delete student",
    "data": null,
    "errorCode": "STUDENT_DELETE_FAILED_503"
  }
  ```

---

## Quick Reference Table

| Error Code | Status | Message | Endpoint |
|-----------|--------|---------|----------|
| INVALID_STUDENT_ID_400 | 400 | Invalid student id | GET/:id, PUT, DELETE |
| INVALID_STUDENT_MATRIC_400 | 400 | Invalid Student Matric | POST, PUT |
| INVALID_EMAIL_400 | 400 | Invalid email input | POST, PUT |
| INVALID_NO_KP_400 | 400 | Invalid No KP input | POST, PUT |
| INVALID_COURSE_ID_400 | 400 | Invalid Course Id | POST, PUT |
| REQUIRED_MATRIC_NO_400 | 400 | Missing required Matric Number | POST |
| REQUIRED_NO_KP_400 | 400 | Missing required No KP | POST |
| REQUIRED_EMAIL_400 | 400 | Missing required Email | POST |
| REQUIRED_STUDENT_NAME_400 | 400 | Missing required Student Name | POST |
| REQUIRED_COURSE_ID_400 | 400 | Missing required Course ID | POST |
| REQUIRED_ERROR_400 | 400 | Missing required fields | PUT |
| STUDENT_NOT_CREATED_400 | 400 | Student not created | POST |
| STUDENT_NOT_FOUND_404 | 404 | Student not found / Student Not Found | GET/:id, PUT, DELETE |
| COURSE_NOT_FOUND_404 | 404 | Course Not Found | POST, PUT |
| DUPLICATE_STUDENT_409 | 409 | Student Already Exists / Student information already exists | POST, PUT |
| STUDENT_FETCH_FAILED_503 | 503 | Failed to fetch students | GET |
| STUDENT_RETRIEVE_FAILED_503 | 503 | Failed to retrieve student | GET/:id |
| STUDENT_CREATE_FAILED_503 | 503 | Failed to create student | POST |
| STUDENT_UPDATE_FAILED_503 | 503 | Failed to update student | PUT |
| STUDENT_DELETE_FAILED_503 | 503 | Failed to delete student | DELETE |