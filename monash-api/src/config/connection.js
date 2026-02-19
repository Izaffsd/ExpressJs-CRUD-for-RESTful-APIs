import mysql from 'mysql2/promise'
import logger from '../utils/logger.js';

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monash',
    connectionLimit: 10,
    queueLimit: 50,
})

export const connectDB = async () => {
    try {
      const conn = await db.getConnection();
      await conn.ping();
      conn.release();
      console.log("MySQL database connected successfully");
    } catch (err) {
      console.error("MySQL connection error:", err);
      logger.error({ message: 'MySQL connection error', ...err })
      process.exit(1);
    }
};

export default db