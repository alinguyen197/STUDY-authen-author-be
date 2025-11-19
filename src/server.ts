import express, { Application } from 'express'
import dotenv from 'dotenv'

import initWebRoutes from './routes'
import cors from 'cors'
import { connectDB } from './config/connectDB'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()
const app: Application = express()
app.use(cors({ origin: true, credentials: true })) // Cấu hình CORS

// Middleware để parse JSON request body
app.use(express.json())
// Middleware để parse URL-encoded request body
app.use(express.urlencoded({ extended: true }))

initWebRoutes(app) // Khởi tạo các route từ src/routes/index.ts

connectDB() // Kết nối database
const PORT = process.env.PORT || 4000

// Sử dụng middleware xử lý tất cả các lỗi chung
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
