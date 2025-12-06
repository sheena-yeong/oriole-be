import { Request, Response } from 'express';
import { fetchCoins } from '../services/coinGecko';
import { Coin } from '../models/Coin';

export async function getCoins(req: Request, res: Response) {
  try {
    const data = await fetchCoins();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function addWatchListCoins(req: Request, res: Response) {
  try {
    const coins = req.body;

    if (coins.length === 0) {
      return res
        .status(500)
        .json({ error: 'Request body must be a non-empty array of coins.' });
    }

    const newCoins = await Coin.bulkCreate(coins);

    res.status(201).json(newCoins);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
