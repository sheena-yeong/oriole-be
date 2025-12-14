import express from 'express';
const router = express.Router();
import {
  createPaymentIntent,
  confirmPayment,
} from '../controllers/paymentController';

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);


export default router;
