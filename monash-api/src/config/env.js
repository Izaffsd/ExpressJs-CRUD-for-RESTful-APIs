import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default("4000"),

  MORGAN_LOG: z
    .enum(["development", "uat", "production"])
    .default("development"),

  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().optional().default(""),
  DB_NAME: z.string().min(1),

  DATABASE_URL: z.url()
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("Invalid environment variables:")
  console.error(parsedEnv.error.format())
  process.exit(1) // STOP SERVER (fail fast)
}

export const env = parsedEnv.data
