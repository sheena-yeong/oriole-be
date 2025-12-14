import express from 'express';
const router = express.Router();
import {
  topUpWallet,
  getWalletBalance,
} from '../controllers/walletController';

router.get('/', getWalletBalance);
router.post('/', topUpWallet)

export default router;
