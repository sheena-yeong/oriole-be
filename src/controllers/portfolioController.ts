import { Request, Response } from 'express';
import { UserCoins } from '../models/UserCoins';
import { fetchCoins } from '../services/coinGecko';
import { CacheService } from '../services/cache';
import { CoinData } from '../types/coins';

const COIN_CACHE_KEY = 'coingecko:coins';
const COIN_DETAILS_CACHE_TTL = 300;


export async function getUserPortfolio(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const coins = await UserCoins.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']],
    });

    const coinIds = coins.map(coin => coin.coinId);

    let coinGeckoData = await CacheService.get<CoinData[]>(COIN_CACHE_KEY);

    if (!coinGeckoData) {
      coinGeckoData = await fetchCoins();
      await CacheService.set(COIN_CACHE_KEY, coinGeckoData, COIN_DETAILS_CACHE_TTL);
    } 

    const populatedData = coinGeckoData.filter(coin => coinIds.includes(coin.id));

    const portfolioData = coins.map(userCoin => {
      const marketCoin = coinGeckoData.find(coin => coin.id === userCoin.coinId);
      return {
        ...userCoin.toJSON(),
        marketData: marketCoin
      }
    })

    return res.json(portfolioData);
  } catch (err) {
    console.error('Error getting portfolio:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to get portfolio',
    });
  }
}