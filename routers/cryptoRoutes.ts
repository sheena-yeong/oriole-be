import express from 'express';
const router = express.Router();
import { getCoins, addWatchListCoins } from '../controllers/cryptoController';

router.get('/', getCoins);
router.post('/', addWatchListCoins);

export default router;
