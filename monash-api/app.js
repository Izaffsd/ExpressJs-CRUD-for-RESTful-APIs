import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import routes from './routes/index.js'

const app = express()
// export app

// Middleware
if (process.env.MORGAN_LOG === 'production') {
    app.use(morgan('combined'))
} else {
    app.use(morgan('dev'))
}

app.use(express.json()) // better than body-parser

app.use('/', routes)

export default app