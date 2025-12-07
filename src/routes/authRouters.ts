import express from 'express'
import authController from '../controllers/authController'
const router = express.Router()

// router.get('/home', (req, res) => {
//   res.send('Welcome to the Home Page!');
// });

router.post('/login', authController.login)
router.post('/refresh-token', authController.login)

export default router
