import 'dotenv/config'
import app from './app.js'
import { connectDB } from './src/config/connection.js'

const PORT = process.env.PORT || 4000

connectDB()
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})