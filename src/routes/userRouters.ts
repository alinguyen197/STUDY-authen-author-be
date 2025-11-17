import express from 'express'
import userController from '../controllers/userController'
import { authenticateJWT } from '../middlewares/authMiddleware'
const router = express.Router()

router.get('/get-all-users', authenticateJWT, userController.getAllUsers)

export default router
