import express from 'express';
const router = express.Router();
import { createPaymentIntent } from '../controllers/paymentController';

router.post('/', createPaymentIntent)

export default router;