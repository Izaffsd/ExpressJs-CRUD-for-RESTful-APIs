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

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') //. * all the domains
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Methods', ' POST, PUT, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use(express.json()) // better than body-parser

app.use('/api', routes)

export default app