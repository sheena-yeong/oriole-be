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
  getTopGainers,
  getTopLosers,
  getCoinDescription
} from '../controllers/cryptoDataController';

router.get('/', getCoins);

router.post('/watchlist', addWatchListCoins);
router.get('/watchlist', getWatchListCoins);
router.delete('/watchlist', deleteWatchListCoins);

router.get('/:id/market-chart', getMarketChart);
router.get('/fear-greed', getFearGreedLatest);
router.get('/trending', getTrendingSearches);
router.get('/gainers', getTopGainers);
router.get('/losers', getTopLosers);
router.get('/description/:id', getCoinDescription);


export default router;
