import { Request, Response } from 'express';
import { fetchCoins } from '../services/coinGecko';
import { WatchList } from '../models/WatchList';
import { CacheService } from '../services/cache';
import type { CoinData } from '../../types/coins';

const CACHE_KEY = 'coingecko:coins';
const CACHE_TTL = 300;

export async function getCoins(req: Request, res: Response) {
  try {
    const cachedData = await CacheService.get<CoinData[]>(CACHE_KEY);

    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await fetchCoins();
    await CacheService.set(CACHE_KEY, data, CACHE_TTL);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function addWatchListCoins(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const coins = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (coins.length === 0) {
      return res
        .status(500)
        .json({ error: 'Request body must be a non-empty array of coins.' });
    }

    const coinsWithUserId = coins.map((c) => ({
      ...c,
      userId,
    }));

    const newCoins = await WatchList.bulkCreate(coinsWithUserId);

    res.status(201).json(newCoins);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function getWatchListCoins(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await WatchList.findAll({
      where: { userId },
    });
    const symbols = data.map((d) => d.symbol);

    let coinGeckoData = await CacheService.get<CoinData[]>(CACHE_KEY); // Add type parameter

    if (!coinGeckoData) {
      coinGeckoData = await fetchCoins();
      await CacheService.set(CACHE_KEY, coinGeckoData, CACHE_TTL);
    } else {
      console.log('Watchlist from cache');
    }

    const populatedData = coinGeckoData.filter((c) =>
      symbols.includes(c.symbol)
    );

    res.json(populatedData);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function deleteWatchListCoins(req: Request, res: Response) {
  try {
    const { symbol } = req.body;
    console.log('Symbol to delete', symbol);
    const userId = req.user?.id;
    const data = await WatchList.destroy({
      where: { userId, symbol },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
