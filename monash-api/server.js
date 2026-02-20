import env from './src/config/env.js'
import app from './app.js'
import { connectDB } from './src/config/connection.js'


await connectDB()
app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})