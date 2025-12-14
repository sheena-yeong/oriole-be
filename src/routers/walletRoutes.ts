import express from 'express';
const router = express.Router();
import {
  topUpWallet,
  getWalletBalance,
  purchaseCrypto
} from '../controllers/walletController';

router.get('/', getWalletBalance);
router.post('/', topUpWallet)
router.post('/purchase', purchaseCrypto)


export default router;
