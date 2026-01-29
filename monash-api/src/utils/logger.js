import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // error only
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // // all log
    // new winston.transports.File({
    //   filename: 'logs/combined.log',
    // }),
  ],
})

// Console hanya untuk dev
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger
