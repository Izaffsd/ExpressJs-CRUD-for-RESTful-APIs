import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import routes from './src/routes/index.js'
import cors from 'cors'

const app = express()
// export app

// Middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'))
} else {
    app.use(morgan('dev'))
}

// CORS Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://mydomain.com'],
  credentials: true
}))


app.use(express.json()) // better than body-parser

app.use(express.static('public'))

app.use('/api', routes)

export default app