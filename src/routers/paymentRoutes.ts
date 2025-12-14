import express from 'express';
const router = express.Router();
import {
  createPaymentIntent,
  confirmPayment,
  purchaseCrypto,
} from '../controllers/paymentController';

router.post('/', purchaseCrypto)
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);


export default router;
