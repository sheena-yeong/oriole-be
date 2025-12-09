import express from 'express';
const router = express.Router();
import {
  getCoins,
  addWatchListCoins,
  getWatchListCoins,
  deleteWatchListCoins,
  getMarketChart,
  getFearGreedLatest
} from '../controllers/cryptoController';

router.get('/', getCoins);
router.post('/watchlist', addWatchListCoins);
router.get('/watchlist', getWatchListCoins);
router.delete('/watchlist', deleteWatchListCoins);
router.get('/:id/market-chart', getMarketChart)
router.get('/fear-greed', getFearGreedLatest)

export default router;
