import { Request, Response } from 'express';
import { fetchCoins } from '../services/coinGecko';
import { fetchMarketChart } from '../services/coinGecko';
import { fetchFearGreedLatest } from '../services/coinyBubble';
import { fetchTrendingSearches } from '../services/coinGecko';
import { WatchList } from '../models/WatchList';
import { CacheService } from '../services/cache';
import type { CoinData } from '../types/coins';

const COIN_CACHE_KEY = 'coingecko:coins';
const MARKET_CACHE_KEY = `coingecko:market-chart`;
const FG_IDX_CACHE_KEY = `coinybubble:fear-greed-index`;
const TRENDING_CACHE_KEY = `coingecko:trending-searches`;


const COIN_DETAILS_CACHE_TTL = 300;
const FG_IDX_CACHE_TTL = 300;
const MARKET_CHART_CACHE_TTL = 600;
const TRENDING_CACHE_TTL = 300;


export async function getCoins(req: Request, res: Response) {
  try {
    const cachedData = await CacheService.get<CoinData[]>(COIN_CACHE_KEY);

    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await fetchCoins();
    await CacheService.set(COIN_CACHE_KEY, data, COIN_DETAILS_CACHE_TTL);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function addWatchListCoins(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const coins = req.body;

    console.log('Received coins:', coins);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!Array.isArray(coins) || coins.length === 0) {
      return res
        .status(400)
        .json({ error: 'Request body must be a non-empty array of coins.' });
    }

    const existingCoins = await WatchList.findAll({
      where: {
        userId,
        coinId: coins.map((c) => c.id),
      },
    });

    const existingIds = new Set(existingCoins.map((c) => c.coinId));

    const newCoinsToAdd = coins
      .filter((c) => !existingIds.has(c.id))
      .map((c) => ({
        coinId: c.id,
        userId,
      }));

    console.log('New coins to add:', newCoinsToAdd);

    if (newCoinsToAdd.length === 0) {
      return res.status(200).json({
        message: 'All coins already in watchlist',
        added: [],
      });
    }

    const newCoins = await WatchList.bulkCreate(newCoinsToAdd);

    res.status(201).json({
      message: `Successfully added ${newCoins.length} coin(s)`,
      added: newCoins,
    });
  } catch (err) {
    console.error('Error adding watchlist coins:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to add coins',
    });
  }
}

export async function getWatchListCoins(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = await WatchList.findAll({
      where: { userId },
    });
    const coinIds = data.map((d) => d.coinId);

    let coinGeckoData = await CacheService.get<CoinData[]>(COIN_CACHE_KEY);

    if (!coinGeckoData) {
      coinGeckoData = await fetchCoins();
      await CacheService.set(
        COIN_CACHE_KEY,
        coinGeckoData,
        COIN_DETAILS_CACHE_TTL
      );
    } else {
      console.log('Watchlist from cache');
    }

    const populatedData = coinGeckoData.filter((c) => coinIds.includes(c.id));

    res.json(populatedData);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function deleteWatchListCoins(req: Request, res: Response) {
  try {
    const { id } = req.body;
    console.log('Coin ID to delete', id);
    const userId = req.user?.id;
    const data = await WatchList.destroy({
      where: { userId, coinId: id },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function getMarketChart(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const days = Number(req.query.days);
    const cacheKey = `${MARKET_CACHE_KEY}:${id}:${days}`;
    const cachedChart = await CacheService.get(cacheKey);

    if (cachedChart) {
      console.log(`Market chart for ${id} (${days}d) from cache`);
      return res.json(cachedChart);
    }

    const data = await fetchMarketChart(id, days);

    await CacheService.set(MARKET_CACHE_KEY, data, MARKET_CHART_CACHE_TTL);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function getFearGreedLatest(req: Request, res: Response) {
  try {
    const cachedData = await CacheService.get(FG_IDX_CACHE_KEY);

    if (cachedData) {
      console.log(`Fear-greed index from cache`);
      return res.json(cachedData);
    }

    const data = await fetchFearGreedLatest();
    await CacheService.set(FG_IDX_CACHE_KEY, data, FG_IDX_CACHE_TTL);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function getTrendingSearches(req: Request, res: Response) {
  try {
    const cachedData = await CacheService.get(TRENDING_CACHE_KEY);

    if (cachedData) {
      console.log(`Fear-greed index from cache`);
      return res.json(cachedData);
    }

    const data = await fetchTrendingSearches();
    await CacheService.set(TRENDING_CACHE_KEY, data, TRENDING_CACHE_TTL);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}