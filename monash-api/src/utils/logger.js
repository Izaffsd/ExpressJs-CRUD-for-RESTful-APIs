import winston from 'winston'

const logger = winston.createLogger({
  level: 'error', // (matching usage in errorHandler)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to file
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
