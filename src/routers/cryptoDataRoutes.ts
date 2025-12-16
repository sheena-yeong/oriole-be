import express from 'express';
const router = express.Router();
import {
  getCoins,
  addWatchListCoins,
  getWatchListCoins,
  deleteWatchListCoins,
  getMarketChart,
  getFearGreedLatest,
  getTrendingSearches,
} from '../controllers/cryptoDataController';

router.get('/', getCoins);

router.post('/watchlist', addWatchListCoins);
router.get('/watchlist', getWatchListCoins);
router.delete('/watchlist', deleteWatchListCoins);

router.get('/:id/market-chart', getMarketChart);
router.get('/fear-greed', getFearGreedLatest);
router.get('/trending', getTrendingSearches);

export default router;
