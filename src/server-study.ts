// import express from 'express'
// import cookieParser from 'cookie-parser'
// import cors from 'cors'
// import dotenv from 'dotenv'
// import connectDB from './config/connectDB'
// import routes from './routes'
// import { errorHandler } from './middlewares/errorHandler'
// import cleanupJob from './jobs/cleanupJob'
// import redisClient from './config/redis'

// dotenv.config()

// const app = express()
// const PORT = process.env.PORT || 5000

// // Middlewares
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:3000',
//     credentials: true,
//   })
// )
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())

// // Routes
// app.use('/api', routes)

// // Error handler
// app.use(errorHandler)

// // Start server
// const startServer = async () => {
//   try {
//     await connectDB()

//     // Start cleanup cron job
//     cleanupJob.start()

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`)
//     })
//   } catch (error) {
//     console.error('Failed to start server:', error)
//     process.exit(1)
//   }
// }

// startServer()
