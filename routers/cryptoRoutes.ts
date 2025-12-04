import express from 'express';
const router = express.Router();
import { getCoins } from '../controllers/cryptoController';

router.get('/', getCoins);

export default router;
