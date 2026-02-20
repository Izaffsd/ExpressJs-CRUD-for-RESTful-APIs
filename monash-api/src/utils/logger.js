import winston from 'winston'
import fs from 'fs'

// Auto-create logs/ folder kalau takde
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // // Log ALL info & error into file
    // new winston.transports.File({
    // filename: 'logs/app.log'
    // }),
    // Log errors to error file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  ]
})

// Console output for development only
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  )
}

export default logger
