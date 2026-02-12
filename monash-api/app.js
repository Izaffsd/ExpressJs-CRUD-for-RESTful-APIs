import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import cors from 'cors'
import routes from './src/routes/index.js'
import { errorHandler } from './src/middleware/errorHandler.js'

const app = express()

// Middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'))
} else {
    app.use(morgan('dev'))
}

// CORS Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://devlopmentserver.com'],
  credentials: true
}))

// client sent json -> auto parse to JS object
app.use(express.json())

app.use('/api', routes)

app.use(express.static('public'))

// all routes 404 handler
app.use((req, res, next) => {
  const error = new Error(`Resource not found`)
  error.statusCode = 404
  error.errorCode = 'RESOURCE_NOT_FOUND_404'
  next(error)
})

// Global error handler (LAST)
app.use(errorHandler)


export default app