import express from 'express';
import homeController from '../controllers/homeController';
const router = express.Router();

// router.get('/home', (req, res) => {
//   res.send('Welcome to the Home Page!');
// });

router.get('/home', homeController.getAllUsers);

export default router;
