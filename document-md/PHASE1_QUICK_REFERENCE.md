# 📋 Phase 1 Quick Reference Checklist

## Installation

```bash
npm install cors uuid jsonwebtoken
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage"
  }
}
```

---

## File Checklist

### Create These Files (Copy from PHASE1_IMPLEMENTATION.md)

- [ ] `middleware/auth.js` - JWT + RBAC middleware
- [ ] `middleware/requestId.js` - Request ID tracking
- [ ] `services/auth.service.js` - Token + password utilities
- [ ] `controllers/auth.controller.js` - Signup/Login handlers
- [ ] `routes/auth.routes.js` - Auth endpoints
- [ ] `utils/responseMapper.js` - Response standardization

### Update These Files

- [ ] `app.js` - Add middleware stack + imports
- [ ] `routes/index.js` - Mount auth routes
- [ ] `routes/students.routes.js` - Add auth guards to all routes
- [ ] `routes/courses.routes.js` - Add auth guards to all routes
- [ ] `middleware/errorHandler.js` - Optional: Better error messages
- [ ] `.env` - Add JWT_SECRET, FRONTEND_URL
- [ ] Database schema - Add password_hash column

---

## Code Snippets

### Add to `app.js` (Top)

```javascript
import cors from 'cors'
import { requestIdMiddleware } from './middleware/requestId.js'
```

### Add to `app.js` (After imports, before routes)

```javascript
app.use(requestIdMiddleware)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))
```

### Update `routes/index.js`

```javascript
import authRoutes from './auth.routes.js'

// Add this line:
router.use(authRoutes)
```

### Update `routes/students.routes.js` (Top)

```javascript
import { authenticate, authorize, ownerOnly } from '../middleware/auth.js'
```

### Update Each Route

```javascript
// Before:
router.get('/students', getAllStudents)

// After:
router.get('/students', authenticate, authorize('admin', 'lecturer'), getAllStudents)
```

---

## Database Changes

```sql
-- Add password column
ALTER TABLE student ADD COLUMN password_hash VARCHAR(255);

-- Make email unique for auth
ALTER TABLE student ADD UNIQUE INDEX idx_email (email);

-- Add audit columns (optional but recommended)
ALTER TABLE student ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE student ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

## .env Configuration

```env
# Add these if not present:
JWT_SECRET=your-min-32-character-random-secret-key-change-this
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Testing Flow

### 1. Signup
```bash
curl -X POST http://localhost:5000/auth/signup/student \
  -H "Content-Type: application/json" \
  -d '{
    "matric_no": "CS2024",
    "email": "test@monash.edu.my",
    "password": "SecurePass123",
    "student_name": "Test Student",
    "course_id": 1
  }'
```

Copy the `token` from response.

### 2. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@monash.edu.my",
    "password": "SecurePass123"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer TOKEN_HERE"
```

Replace `TOKEN_HERE` with actual token.

### 4. Try Wrong Password
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@monash.edu.my",
    "password": "WrongPassword"
  }'
# Should return 401
```

### 5. Try Without Auth Header
```bash
curl -X GET http://localhost:5000/auth/me
# Should return 401 - Missing token
```

---

## Common Issues & Fixes

### Issue: "Cannot find module 'cors'"
**Fix:** `npm install cors`

### Issue: "JWT is not defined"
**Fix:** Add `import jwt from 'jsonwebtoken'` to auth.js

### Issue: "ENOENT: no such file or directory, open '.env'"
**Fix:** Create `.env` file with required variables

### Issue: "Database error: UNKNOWN COLUMN 'password_hash'"
**Fix:** Run the ALTER TABLE command above

### Issue: "Token expired"
**Fix:** This is correct behavior. Generate new token via login

### Issue: "Duplicate entry for email"
**Fix:** Email already exists. Use different email for test

---

## Middleware Order in app.js (IMPORTANT)

Order matters! Must be:

```javascript
1. requestIdMiddleware      ← Add to req.id
2. cors()                   ← Set headers
3. morgan logging           ← Log requests
4. express.json()           ← Parse body
5. routes                   ← Handle requests
6. notFoundHandler          ← 404 if no match
7. errorHandler             ← Catch errors
```

Wrong order = middleware doesn't work.

---

## Access Control Matrix

After implementing auth, your API should enforce:

```
                  | Student | Lecturer | Admin |
GET /students     |    ✗    |    ✓     |   ✓   |
GET /students/:id |   Own   |    ✓     |   ✓   |
POST /students    |    ✗    |    ✗     |   ✓   |
PUT /students     |   Own   |    ✗     |   ✓   |
DELETE /students  |    ✗    |    ✗     |   ✓   |

GET /courses      |    ✓    |    ✓     |   ✓   |
POST /courses     |    ✗    |    ✗     |   ✓   |
PUT /courses      |    ✗    |    ✗     |   ✓   |
DELETE /courses   |    ✗    |    ✗     |   ✓   |
```

Test each one.

---

## Frontend Integration Preview

### axios.ts setup:

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### Login component (pseudocode):

```typescript
const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password })
  localStorage.setItem('authToken', res.data.payload.token)
  router.push('/dashboard')
}
```

---

## Troubleshooting Checklist

- [ ] Node running? `npm run dev`
- [ ] MySQL running? Check connection
- [ ] Port 5000 open? Check firewall
- [ ] .env file exists? With JWT_SECRET?
- [ ] CORS enabled? Check middleware
- [ ] Auth middleware imported? Check app.js
- [ ] Routes updated? Check students.routes.js
- [ ] Database schema updated? Check password_hash column
- [ ] Packages installed? `npm install`

---

## Postman Collection (Import This)

Create `Monash.postman_collection.json`:

```json
{
  "info": { "name": "Monash API" },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/signup/student",
            "body": {
              "raw": "{\"matric_no\": \"CS2024\", \"email\": \"test@example.com\", \"password\": \"Pass123\", \"student_name\": \"Test\", \"course_id\": 1}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "raw": "{\"email\": \"test@example.com\", \"password\": \"Pass123\"}"
            }
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/auth/me",
            "header": {
              "Authorization": "Bearer {{token}}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Performance Tips

1. **Use connection pooling** ✓ (already configured)
2. **Index foreign keys** - MySQL does automatically
3. **Avoid N+1 queries** - Load all data at once
4. **Cache frequently accessed data** - Phase 2
5. **Use query pagination** - Phase 2

---

## Security Checklist

- [ ] JWT_SECRET is 32+ random characters
- [ ] CORS limited to frontend URL only
- [ ] Passwords never logged
- [ ] Tokens expire after reasonable time (7d)
- [ ] No sensitive data in error messages
- [ ] SQL queries parameterized (✓ already done)
- [ ] Input validation everywhere (✓ already done)
- [ ] Rate limiting added (Phase 2)

---

## Next After Phase 1

Once auth is complete:

1. **File upload** - Add multer middleware
2. **Rate limiting** - Add express-rate-limit
3. **Validation middleware** - Zod integration
4. **Response pagination** - Limit + offset
5. **Document workflow** - Core feature

---

## Key Metrics to Track

- [ ] Response times (< 100ms for small queries)
- [ ] Error rate (< 0.1%)
- [ ] Token generation time (< 10ms)
- [ ] Database query time (< 50ms)
- [ ] API uptime (target: 99.9%)

---

## Reference Links

- [Express Authentication](https://expressjs.com/en/guide/using-middleware.html)
- [JWT.io Debugger](https://jwt.io)
- [REST API Best Practices](https://restfulapi.net)
- [OWASP Security](https://owasp.org/www-project-top-ten)

---

**Status: Ready to implement!** ✅

Start with Step 1 from PHASE1_IMPLEMENTATION.md

