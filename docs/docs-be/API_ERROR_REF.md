# API Error Codes Reference

## Global Error Codes

### Server Errors (500)
| Error Code | Message | Trigger |
|------------|---------|---------|
| `INTERNAL_SERVER_ERROR_500` | Internal Server Error | Unexpected database/server error, connection failures, unknown errors |

---

## Student Error Codes

### Validation Errors (400)

#### Required Fields
| Error Code | Message |
|------------|---------|
| `REQUIRED_MATRIC_NUMBER_400` | Missing required Matric Number |
| `REQUIRED_MYKAD_NUMBER_400` | Missing required MyKad Number |
| `REQUIRED_EMAIL_400` | Missing required Email |
| `REQUIRED_STUDENT_NAME_400` | Missing required Student Name |
| `REQUIRED_COURSE_ID_400` | Missing required Course ID |
| `REQUIRED_ERROR_400` | Missing required fields |

#### Format Validation
| Error Code | Message |
|------------|---------|
| `INVALID_STUDENT_ID_400` | Invalid student id |
| `INVALID_STUDENT_MATRIC_400` | Invalid Student Matric |
| `INVALID_EMAIL_400` | Invalid email input |
| `INVALID_MYKAD_NUMBER_400` | Invalid MyKad number. Must be 12 digits (YYMMDDxxxxxx). |
| `INVALID_COURSE_ID_400` | Invalid Course Id |
| `STUDENT_NOT_CREATED_400` | Student not created |

### Not Found Errors (404)
| Error Code | Message |
|------------|---------|
| `STUDENT_NOT_FOUND_404` | Student does not exist |
| `COURSE_NOT_FOUND_404` | Course does not exists |

### Conflict Errors (409)
| Error Code | Message |
|------------|---------|
| `DUPLICATE_STUDENT_409` | Student Already Exists |

---

## Course Error Codes

### Validation Errors (400)

#### Required Fields
| Error Code | Message |
|------------|---------|
| `REQUIRED_COURSE_CODE_400` | Missing required Course Code |
| `REQUIRED_COURSE_NAME_400` | Missing required Course Name |
| `REQUIRED_ERROR_400` | Missing required fields |

#### Format Validation
| Error Code | Message |
|------------|---------|
| `INVALID_COURSE_ID_400` | Invalid Course Id |
| `INVALID_COURSE_CODE_400` | Invalid code. Must be at least 2 characters and uppercase. |
| `COURSE_NOT_CREATED_400` | Course not created |

### Not Found Errors (404)
| Error Code | Message |
|------------|---------|
| `COURSE_NOT_FOUND_404` | Course does not exist |

### Conflict Errors (409)
| Error Code | Message |
|------------|---------|
| `DUPLICATE_COURSE_409` | Course Already Exists |
| `DUPLICATE_COURSE_CODE_409` | Course Code already exists |

---

## Complete Error Code List (Alphabetical)

| Error Code | HTTP | Message | Resource |
|------------|------|---------|----------|
| `COURSE_NOT_CREATED_400` | 400 | Course not created | Course |
| `COURSE_NOT_FOUND_404` | 404 | Course does not exist | Course |
| `DUPLICATE_COURSE_409` | 409 | Course Already Exists | Course |
| `DUPLICATE_COURSE_CODE_409` | 409 | Course Code already exists | Course |
| `DUPLICATE_STUDENT_409` | 409 | Student Already Exists | Student |
| `INTERNAL_SERVER_ERROR_500` | 500 | Internal Server Error | Global |
| `INVALID_COURSE_CODE_400` | 400 | Invalid code. Must be at least 2 characters and uppercase. | Course |
| `INVALID_COURSE_ID_400` | 400 | Invalid Course Id | Both |
| `INVALID_EMAIL_400` | 400 | Invalid email input | Student |
| `INVALID_MYKAD_NUMBER_400` | 400 | Invalid MyKad number. Must be 12 digits (YYMMDDxxxxxx). | Student |
| `INVALID_STUDENT_ID_400` | 400 | Invalid student id | Student |
| `INVALID_STUDENT_MATRIC_400` | 400 | Invalid Student Matric | Student |
| `REQUIRED_COURSE_CODE_400` | 400 | Missing required Course Code | Course |
| `REQUIRED_COURSE_ID_400` | 400 | Missing required Course ID | Student |
| `REQUIRED_EMAIL_400` | 400 | Missing required Email | Student |
| `REQUIRED_ERROR_400` | 400 | Missing required fields | Both |
| `REQUIRED_MATRIC_NUMBER_400` | 400 | Missing required Matric Number | Student |
| `REQUIRED_MYKAD_NUMBER_400` | 400 | Missing required MyKad Number | Student |
| `REQUIRED_STUDENT_NAME_400` | 400 | Missing required Student Name | Student |
| `REQUIRED_COURSE_NAME_400` | 400 | Missing required Course Name | Course |
| `STUDENT_NOT_CREATED_400` | 400 | Student not created | Student |
| `STUDENT_NOT_FOUND_404` | 404 | Student does not exist | Student |

---

## Error Response Examples

### Validation Error (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Missing required Course Code",
  "errorCode": "REQUIRED_COURSE_CODE_400",
  "timestamp": "2026-02-10T05:00:00.000Z",
  "errors": []
}
```

### Not Found Error (404)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Student does not exist",
  "errorCode": "STUDENT_NOT_FOUND_404",
  "timestamp": "2026-02-10T05:00:00.000Z",
  "errors": []
}
```

### Conflict Error (409)
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Course Already Exists",
  "errorCode": "DUPLICATE_COURSE_409",
  "timestamp": "2026-02-10T05:00:00.000Z",
  "errors": [{
    "code": "CUSTOM_ERROR_CODE"
  }]
}
```

### Server Error (500)
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal Server Error",
  "errorCode": "INTERNAL_SERVER_ERROR_500",
  "timestamp": "2026-02-10T05:00:00.000Z"
}
```

---

## Error Code Statistics

**Total Error Codes:** 22

**By HTTP Status:**
- 400 (Bad Request): 15 codes
- 404 (Not Found): 3 codes
- 409 (Conflict): 3 codes
- 500 (Server Error): 1 code

**By Resource:**
- Student: 12 codes
- Course: 9 codes
- Global: 1 code
- Shared: 2 codes (`INVALID_COURSE_ID_400`, `REQUIRED_ERROR_400`)

---

## Quick Reference Card

### Student Endpoints
- **POST** `/api/students` → Can return: 400 (x7), 404 (x1), 409 (x1), 500
- **GET** `/api/students/:id` → Can return: 400 (x1), 404 (x1), 500
- **PUT** `/api/students/:id` → Can return: 400 (x7), 404 (x2), 409 (x1), 500
- **DELETE** `/api/students/:id` → Can return: 400 (x1), 404 (x1), 500

### Course Endpoints
- **POST** `/api/courses` → Can return: 400 (x3), 409 (x1), 500
- **GET** `/api/courses/:code` → Can return: 400 (x1), 404 (x1), 500
- **PUT** `/api/courses/:id` → Can return: 400 (x3), 404 (x1), 409 (x1), 500
- **DELETE** `/api/courses/:id` → Can return: 400 (x1), 404 (x1), 500