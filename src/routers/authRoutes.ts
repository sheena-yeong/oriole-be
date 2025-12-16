import express from 'express';
const router = express.Router();
import { signUp, signIn, changePassword } from '../controllers/authController';
import { verifyToken } from '../middleware/verifyToken';

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/change-password', verifyToken, changePassword)


export default router;
