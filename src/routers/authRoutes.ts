import express from 'express';
const router = express.Router();
import { signUp, signIn } from '../controllers/authController';

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);


export default router;
