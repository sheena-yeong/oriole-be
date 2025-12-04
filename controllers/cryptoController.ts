import { Request, Response } from 'express';
import { fetchCoins } from '../services/coinGecko';

export async function getCoins(req: Request, res: Response) {
  try {
    const data = await fetchCoins();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
