# 🎯 Frontend Specification & Implementation Prompt for AI

## Context: Backend & Database Schema

### Project Overview
- **Backend:** Node.js + Express API (ES Modules)
- **Frontend:** Next.js 14+ (TypeScript)
- **Database:** MySQL with student and courses tables
- **Authentication:** JWT-based with role-based access control

---

## Database Schema (ERD)

### Table: `student`
```sql
CREATE TABLE student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  matric_no VARCHAR(20) UNIQUE NOT NULL,
  no_kp VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  student_name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  gender ENUM('Male', 'Female'),
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

**Key Fields:**
- `student_id`: Primary identifier
- `matric_no`: University matric number (format: A123456789)
- `no_kp`: Malaysian IC number (format: YYMMDD-PP-GGGG)
- `email`: Unique email (required for login)
- `password_hash`: bcrypt hashed password
- `student_name`: Full name of student
- `address`: Residential address
- `gender`: Male or Female
- `course_id`: FK to courses table

### Table: `courses`
```sql
CREATE TABLE courses (
  course_id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `course_id`: Primary identifier
- `course_code`: Course code (format: CS101, BUS202, etc.)
- `course_name`: Full course name

---

## Backend API Endpoints

### Authentication Endpoints
```
POST /auth/login
  Body: { email, password }
  Response: { success, payload: { token, user }, message }

POST /auth/signup/student
  Body: { matric_no, email, password, student_name, course_id }
  Response: { success, payload: { token, user }, message }

GET /auth/me
  Headers: Authorization: Bearer <token>
  Response: { success, payload: { user }, message }
```

### Student Endpoints
```
GET /students
  Auth: admin, lecturer
  Response: Array of student objects

GET /students/:studentId
  Auth: owner or admin
  Response: Single student object

GET /students/matric/:matricNo
  Auth: authenticated users
  Response: Single student (matric_no, student_name)

POST /students
  Auth: admin
  Body: { matric_no, no_kp, email, student_name, address, gender, course_id }
  Response: Created student

PUT /students
  Auth: admin, student (own)
  Body: { student_id, matric_no, email, student_name, address, gender }
  Response: Updated student

DELETE /students/:studentId
  Auth: admin
  Response: Success message
```

### Course Endpoints
```
GET /courses
  Auth: authenticated users
  Response: Array of course objects

GET /courses/:courseCode
  Auth: authenticated users
  Response: Single course

POST /courses
  Auth: admin
  Body: { course_code, course_name }
  Response: Created course

PUT /courses
  Auth: admin
  Body: { course_id, course_code, course_name }
  Response: Updated course

DELETE /courses/:courseId
  Auth: admin
  Response: Success message
```

---

## Standard Response Format

### Success Response
```typescript
{
  success: true,
  payload: data,
  message: "Operation successful",
  statusCode: 200,
  metadata?: { pagination, count, etc }
}
```

### Error Response
```typescript
{
  success: false,
  payload: null,
  message: "Error description",
  statusCode: 400,
  errorCode: "ERROR_CODE_TYPE"
}
```

### Common Error Codes
- `INVALID_EMAIL` - Email format invalid
- `INVALID_STUDENT_MATRIC` - Matric number format invalid
- `INVALID_NO_KP` - IC number format invalid
- `DUPLICATE_STUDENT` - Email or matric already exists
- `COURSE_NOT_FOUND` - Course doesn't exist
- `STUDENT_NOT_FOUND` - Student doesn't exist
- `INVALID_CREDENTIALS` - Login failed
- `UNAUTHORIZED` - Not authenticated (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `SERVER_ERROR` - Internal server error (500)

---

## Access Control Matrix

| Endpoint | Student | Lecturer | Admin |
|----------|---------|----------|-------|
| GET /students | ✗ | ✓ | ✓ |
| GET /students/:id | Own only | ✓ | ✓ |
| POST /students | ✗ | ✗ | ✓ |
| PUT /students | Own only | ✗ | ✓ |
| DELETE /students/:id | ✗ | ✗ | ✓ |
| GET /courses | ✓ | ✓ | ✓ |
| POST /courses | ✗ | ✗ | ✓ |
| PUT /courses | ✗ | ✗ | ✓ |
| DELETE /courses/:id | ✗ | ✗ | ✓ |

---

## Frontend Requirements

### Current State
- **Framework:** Next.js 14+
- **Language:** TypeScript
- **UI Components:** Custom Button component
- **HTTP Client:** Axios configured
- **Services:** Placeholder files (empty) for auth, student, course

### Pages to Build
1. **Auth Pages**
   - `/auth/login` - Login form for all roles
   - `/auth/signup` - Student signup form
   - `/auth/me` - Current user profile

2. **Student Pages**
   - `/dashboard` - Student/lecturer/admin dashboard
   - `/students` - List all students (admin/lecturer)
   - `/students/:id` - View single student
   - `/students/edit` - Edit own profile (students)

3. **Course Pages**
   - `/courses` - List all courses (public, authenticated)
   - `/courses/:id` - View single course
   - `/courses/create` - Create course (admin)
   - `/courses/:id/edit` - Edit course (admin)

4. **Other Pages**
   - `/` - Homepage
   - `/about` - About page

---

## TypeScript Types Needed

### User/Auth Types
```typescript
interface User {
  id: number;
  student_id?: number;
  email: string;
  name: string;
  matric_no?: string;
  role: 'student' | 'lecturer' | 'admin';
}

interface AuthResponse {
  success: boolean;
  payload: {
    token: string;
    user: User;
  };
  message: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  matric_no: string;
  email: string;
  password: string;
  student_name: string;
  course_id: number;
}
```

### Student Types
```typescript
interface Student {
  student_id: number;
  matric_no: string;
  no_kp: string;
  email: string;
  student_name: string;
  address: string;
  gender: 'Male' | 'Female';
  course_id: number;
  created_at: string;
  updated_at: string;
}

interface CreateStudentPayload {
  matric_no: string;
  no_kp: string;
  email: string;
  student_name: string;
  address: string;
  gender: 'Male' | 'Female';
  course_id: number;
}

interface UpdateStudentPayload {
  student_id: number;
  matric_no?: string;
  email?: string;
  student_name?: string;
  address?: string;
  gender?: 'Male' | 'Female';
}
```

### Course Types
```typescript
interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  created_at: string;
  updated_at: string;
}

interface CreateCoursePayload {
  course_code: string;
  course_name: string;
}

interface UpdateCoursePayload {
  course_id: number;
  course_code: string;
  course_name: string;
}
```

### API Response Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  payload: T | null;
  message: string;
  statusCode: number;
  errorCode?: string;
  metadata?: {
    pagination?: { page: number; limit: number; total: number };
    count?: number;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    pagination: { page: number; limit: number; total: number };
    count: number;
  };
}
```

---

## Service Layer Implementation

### Services to Create

#### 1. auth.ts
```typescript
// Functions needed:
- login(email, password): Promise<AuthResponse>
- signup(payload): Promise<AuthResponse>
- logout(): void
- getCurrentUser(): Promise<User>
- isTokenValid(): boolean
- refreshToken(): Promise<string>
```

#### 2. student.ts
```typescript
// Functions needed:
- getAllStudents(token): Promise<ApiResponse<Student[]>>
- getStudentById(id, token): Promise<ApiResponse<Student>>
- createStudent(payload, token): Promise<ApiResponse<Student>>
- updateStudent(payload, token): Promise<ApiResponse<Student>>
- deleteStudent(id, token): Promise<ApiResponse<void>>
- getStudentByMatricNo(matric, token): Promise<ApiResponse<Student>>
```

#### 3. course.ts
```typescript
// Functions needed:
- getAllCourses(token): Promise<ApiResponse<Course[]>>
- getCourseByCode(code, token): Promise<ApiResponse<Course>>
- createCourse(payload, token): Promise<ApiResponse<Course>>
- updateCourse(payload, token): Promise<ApiResponse<Course>>
- deleteCourse(id, token): Promise<ApiResponse<void>>
```

---

## Frontend Features & Components

### Core Features
1. **Authentication**
   - JWT token storage in localStorage
   - Auto-logout on token expiry
   - Protected routes (redirect to login if not authenticated)
   - Role-based access (redirect if insufficient permissions)

2. **Student Management**
   - View student profiles
   - Edit own profile (students)
   - Create students (admin)
   - Delete students (admin)

3. **Course Management**
   - View courses
   - Create courses (admin)
   - Edit courses (admin)
   - Delete courses (admin)

4. **User Experience**
   - Error handling with user-friendly messages
   - Loading states
   - Form validation (client-side)
   - Navigation based on user role

### UI Components to Create
- `<LoginForm />` - Email + password form
- `<SignupForm />` - Student signup with matric + email
- `<StudentForm />` - Create/edit student form
- `<CourseForm />` - Create/edit course form
- `<StudentCard />` - Display student info
- `<CourseCard />` - Display course info
- `<DataTable />` - Generic table component
- `<Navbar />` - Navigation with role-based menu
- `<ProtectedRoute />` - Route guard wrapper
- `<LoadingSpinner />` - Loading indicator
- `<ErrorAlert />` - Error message display

---

## Frontend Architecture

### Folder Structure
```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    (auth)/
      login/page.tsx
      signup/page.tsx
      me/page.tsx
    dashboard/
      page.tsx
    students/
      page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx
      create/page.tsx
    courses/
      page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx
      create/page.tsx
    
  components/
    layout/
      Navbar.tsx
      Footer.tsx
      Sidebar.tsx
    forms/
      LoginForm.tsx
      SignupForm.tsx
      StudentForm.tsx
      CourseForm.tsx
    cards/
      StudentCard.tsx
      CourseCard.tsx
    tables/
      StudentsTable.tsx
      CoursesTable.tsx
    common/
      LoadingSpinner.tsx
      ErrorAlert.tsx
      SuccessAlert.tsx
      DataTable.tsx
    auth/
      ProtectedRoute.tsx
      RoleGuard.tsx
    
  services/
    auth.ts
    student.ts
    course.ts
    api.ts (axios instance)
    
  hooks/
    useAuth.ts
    useStudent.ts
    useCourse.ts
    useLocalStorage.ts
    
  types/
    index.ts (all interfaces)
    
  utils/
    validators.ts (email, matric, IC format)
    formatters.ts (date, currency formats)
    storage.ts (localStorage helpers)
    errors.ts (error mapping)
```

---

## API Integration Points

### Axios Configuration
```typescript
// Base URL: http://localhost:4000(or your backend URL)
// Default headers: Include Authorization: Bearer <token>
// Interceptors:
//   - Add token to all requests
//   - Handle 401 (redirect to login)
//   - Handle 403 (redirect to dashboard)
//   - Transform error responses
```

### Error Handling Strategy
```typescript
// Catch API errors and:
// 1. Map to user-friendly messages
// 2. Log to console (development)
// 3. Show error toast/alert
// 4. Redirect to login on 401
// 5. Redirect to dashboard on 403
```

---

## Form Validation Requirements

### Email Validation
- RFC 5322 compliant
- Must match backend validator

### Matric Number Validation (Students)
- Format: A123456789 (1 letter + 9 digits)
- Must match backend validator

### IC Number Validation (Students)
- Format: YYMMDD-PP-GGGG (14 characters)
- Must match backend validator

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

---

## AI Prompt for Generation

```
Based on the following specification:

DATABASE SCHEMA:
- Student table: student_id, matric_no, no_kp, email, password_hash, student_name, address, gender, course_id
- Courses table: course_id, course_code, course_name

BACKEND API:
- Base URL: http://localhost:3001
- Auth endpoints: /auth/login, /auth/signup/student, /auth/me
- Student endpoints: GET/POST/PUT/DELETE /students, GET /students/:id, GET /students/matric/:matricNo
- Course endpoints: GET/POST/PUT/DELETE /courses

STANDARD RESPONSES:
- Success: { success: true, payload: data, message, statusCode }
- Error: { success: false, payload: null, message, statusCode, errorCode }

ACCESS CONTROL:
- Students: View own profile, view courses
- Lecturers: View all students, view courses
- Admins: Full access to all resources

TECHNOLOGY:
- Frontend: Next.js 14+ with TypeScript
- HTTP Client: Axios
- Storage: localStorage for JWT token
- State Management: Optional (can use Context API or hooks)

GENERATE:
1. Complete TypeScript type definitions for all entities and API responses
2. Service layer (auth.ts, student.ts, course.ts) with all CRUD operations
3. Custom React hooks for data fetching and auth management
4. Form components (LoginForm, SignupForm, StudentForm, CourseForm)
5. Page components for auth, dashboard, students, and courses
6. Protected route wrapper for role-based access control
7. Error handling and toast notifications
8. Form validation utilities
9. API interceptor for token management
10. Complete folder structure and file organization

REQUIREMENTS:
- Use TypeScript with strict mode enabled
- Implement proper error handling
- Add loading states for all async operations
- Include client-side form validation
- Auto-refresh token before expiry
- Redirect to login on 401, dashboard on 403
- Show user-friendly error messages
- Implement loading skeleton or spinner
- Use Tailwind CSS for styling (if CSS framework needed)
- Follow Next.js 14 App Router conventions
- Make code production-ready with proper typing
```

---

## Frontend Checklist

- [ ] TypeScript types defined (interfaces for all entities)
- [ ] Service layer implemented (auth, student, course)
- [ ] Axios instance configured with interceptors
- [ ] Auth context/hook for global state
- [ ] Login page with form validation
- [ ] Signup page with form validation
- [ ] Dashboard page (role-based content)
- [ ] Students list page (admin/lecturer)
- [ ] Student detail page (with role checks)
- [ ] Student edit page
- [ ] Student create page (admin)
- [ ] Courses list page
- [ ] Course detail page
- [ ] Course create page (admin)
- [ ] Course edit page (admin)
- [ ] Protected route wrapper
- [ ] Role-based access control
- [ ] Error handling and alerts
- [ ] Loading states and spinners
- [ ] Form validation utilities
- [ ] Token management (store, refresh, expire)
- [ ] Navigation menu (role-based)
- [ ] Responsive design
- [ ] Token expiry redirect

---

## Success Criteria

✅ Frontend fully typed with TypeScript  
✅ All API endpoints integrated  
✅ Authentication flow working (login → token → protected routes)  
✅ Role-based access control enforced  
✅ Form validation (client-side)  
✅ Error handling with user-friendly messages  
✅ Loading states on all data fetching  
✅ Responsive design on mobile/tablet/desktop  
✅ No console errors or warnings  
✅ Production-ready code structure  

