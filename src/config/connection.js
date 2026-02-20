import mysql from 'mysql2/promise'
import logger from '../utils/logger.js';
import env from '../config/env.js'

const db = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 10,
    queueLimit: 50,
})

export const connectDB = async () => {
    try {
      const conn = await db.getConnection()
      await conn.ping()
      conn.release();
      console.log("MySQL database connected successfully");
    } catch (err) {
      logger.error({ message: 'MySQL connection error', ...err })
      process.exit(1) // exit server error
    }
};

export default db