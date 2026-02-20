import 'dotenv/config'
import { z } from "zod"
import fs from 'fs'

const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number).default("4000"),
  NODE_ENV: z.enum(["development", "uat", "production"]).default("development"),
  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().optional().default(""),
  DB_NAME: z.string().min(1),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error("Invalid environment configuration")
  console.error(result.error.issues)

  // Synchronous — no need to wait
  const logEntry = JSON.stringify({
    level: 'error',
    message: "Invalid environment variables",
    issues: result.error.issues,
    timestamp: new Date().toISOString()
  }) + '\n'

  if (!fs.existsSync('logs')) fs.mkdirSync('logs')
  fs.appendFileSync('logs/error.log', logEntry)

  process.exit(1)  // Selamat exit sekarang
}

export default result.data