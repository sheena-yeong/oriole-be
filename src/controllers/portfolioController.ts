import { Request, Response } from 'express';
import { UserCoins } from '../models/UserCoins';

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

    return res.status(200).json({
      portfolio: coins,
    });
  } catch (err) {
    console.error('Error getting portfolio:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to get portfolio',
    });
  }
}