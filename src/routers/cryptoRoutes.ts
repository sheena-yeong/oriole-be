import express from 'express';
const router = express.Router();
import {
  getCoins,
  addWatchListCoins,
  getWatchListCoins,
  deleteWatchListCoins,
} from '../controllers/cryptoController';

router.get('/', getCoins);
router.post('/watchlist', addWatchListCoins);
router.get('/watchlist', getWatchListCoins);
router.delete('/watchlist', deleteWatchListCoins);

export default router;
